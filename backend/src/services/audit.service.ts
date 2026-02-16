import puppeteer, { type Browser, type Page } from "puppeteer";
import { AxePuppeteer } from "@axe-core/puppeteer";
import { Audit } from "../models/audit.model.js";
import { Project } from "../models/project.model.js";
import {
  RGAA_CRITERIA,
  findRGAAByAxeRule,
} from "../data/rgaa-criteria.js";
import type { ICriteriaAudit, CriteriaResult, IPageAudit, IAuthConfig } from "../types/index.js";

const MAX_PAGES = 20;
const PAGE_TIMEOUT = 30000;
const AUTH_TIMEOUT = 5 * 60 * 1000; // 5 min max for auth

// ─── AUTH SIGNAL MECHANISM ───
// Map auditId → { resolve, reject } to unblock the audit when the user confirms
const authWaiters = new Map<
  string,
  { resolve: () => void; reject: (err: Error) => void }
>();

/** Called by the route POST /api/audits/:auditId/confirm-auth */
export function confirmAuth(auditId: string): boolean {
  const waiter = authWaiters.get(auditId);
  if (waiter) {
    waiter.resolve();
    authWaiters.delete(auditId);
    return true;
  }
  return false;
}

/** Wait for the user to confirm auth (with timeout) */
function waitForAuthConfirmation(auditId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    authWaiters.set(auditId, { resolve, reject });

    setTimeout(() => {
      if (authWaiters.has(auditId)) {
        authWaiters.delete(auditId);
        reject(
          new Error(
            "Timeout : l'authentification n'a pas été confirmée dans les 5 minutes"
          )
        );
      }
    }, AUTH_TIMEOUT);
  });
}

export async function runAudit(projectId: string): Promise<string> {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Projet introuvable");
  }

  const audit = new Audit({
    projectId: project._id.toString(),
    status: "pending",
    url: project.url,
    pagesAudited: [],
    criteria: RGAA_CRITERIA.map((c) => ({
      id: c.id,
      thematique: c.thematique,
      critere: c.critere,
      level: c.level,
      result: "non-testé" as CriteriaResult,
      details: [],
      wcagMapping: c.wcagCriteria,
    })),
  });

  await audit.save();
  const auditId = audit._id.toString();

  runAuditProcess(auditId, project.url, project.auth, project.pages).catch(
    (error) => {
      console.error(`Erreur audit ${auditId}:`, error);
    }
  );

  return auditId;
}

/**
 * Wait for the React DOM to stabilize after a SPA navigation.
 */
async function waitForSPAReady(page: Page, timeout = 5000): Promise<void> {
  try {
    await page.evaluate((ms: number) => {
      return new Promise<void>((resolve) => {
        let lastMutationTime = Date.now();
        const observer = new MutationObserver(() => {
          lastMutationTime = Date.now();
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
        });
        const check = () => {
          if (Date.now() - lastMutationTime > 600) {
            observer.disconnect();
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        setTimeout(check, 400);
        setTimeout(() => { observer.disconnect(); resolve(); }, ms);
      });
    }, timeout);
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
  }
}

/**
 * Inject a hook on history.pushState/replaceState to intercept
 * SPA navigations. Returns the captured URL or null.
 */
async function setupSPANavigationTrap(page: Page): Promise<void> {
  await page.evaluate(() => {
    if ((window as any).__spaNavTrapped) return;
    (window as any).__spaNavTrapped = true;
    (window as any).__lastSpaNav = null;

    const origPush = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);

    history.pushState = function (data: any, unused: string, url?: string | URL | null) {
      (window as any).__lastSpaNav = url || location.href;
      return origPush(data, unused, url);
    };
    history.replaceState = function (data: any, unused: string, url?: string | URL | null) {
      (window as any).__lastSpaNav = url || location.href;
      return origReplace(data, unused, url);
    };

    window.addEventListener("popstate", () => {
      (window as any).__lastSpaNav = location.href;
    });
  });
}

/**
 * Get the last SPA navigation URL captured by the trap, and reset it to null.
 */
async function getLastSPANavigation(page: Page): Promise<string | null> {
  try {
    const nav = await page.evaluate(() => {
      const v = (window as any).__lastSpaNav;
      (window as any).__lastSpaNav = null;
      return v;
    });
    return nav;
  } catch {
    return null;
  }
}

/**
 * Find all "clickable" elements on the page broadly:
 * any element with cursor:pointer that has a reasonable size (cards, buttons, links).
 * Returns the bounding boxes + text to be able to click by coordinates.
 */
async function findAllClickableAreas(page: Page): Promise<
  { x: number; y: number; width: number; height: number; text: string; tag: string }[]
> {
  return page.evaluate(() => {
    const results: { x: number; y: number; width: number; height: number; text: string; tag: string }[] = [];
    const seen = new Set<Element>();

    // Strategy: traverse ALL elements, test cursor:pointer
    const allElements = document.querySelectorAll("*");

    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;

      // Skip elements already seen or too small
      if (seen.has(el)) return;

      const rect = htmlEl.getBoundingClientRect();

      if (rect.width < 60 || rect.height < 30) return;
      // Skip elements outside the viewport (scrollable but not too far)
      if (rect.top > window.innerHeight * 3 || rect.bottom < 0) return;
      if (rect.left > window.innerWidth || rect.right < 0) return;

      const style = window.getComputedStyle(htmlEl);

      // Test 1: cursor pointer
      const hasPointer = style.cursor === "pointer";
      // Test 2: has an onClick listener (React attaches on the root but the element often has role/tabindex)
      const hasInteractive =
        htmlEl.getAttribute("role") === "link" ||
        htmlEl.getAttribute("role") === "button" ||
        htmlEl.getAttribute("role") === "listitem" ||
        htmlEl.getAttribute("role") === "option" ||
        htmlEl.getAttribute("role") === "menuitem" ||
        htmlEl.getAttribute("role") === "tab" ||
        htmlEl.tagName === "A" ||
        htmlEl.tagName === "BUTTON" ||
        htmlEl.getAttribute("tabindex") !== null ||
        htmlEl.hasAttribute("data-href") ||
        htmlEl.hasAttribute("data-to");

      if (!hasPointer && !hasInteractive) return;

      // Exclude generic navigation/header/footer elements
      const tag = htmlEl.tagName.toLowerCase();
      if (tag === "html" || tag === "body" || tag === "head") return;
      if (tag === "nav" || tag === "header" || tag === "footer") return;

      // Exclude input/select/textarea elements (not for navigation)
      if (tag === "input" || tag === "select" || tag === "textarea") return;

      // Avoid clicking on a parent when clicking on the child:
      // keep only the deepest element in each area
      let dominated = false;
      for (const s of seen) {
        const sRect = (s as HTMLElement).getBoundingClientRect();
        // If an already seen element contains this one, skip the parent
        if (
          sRect.left <= rect.left &&
          sRect.top <= rect.top &&
          sRect.right >= rect.right &&
          sRect.bottom >= rect.bottom &&
          (sRect.width * sRect.height) > (rect.width * rect.height) * 0.9
        ) {
          // The seen element is larger → it's a parent, we replace it
          // No, it's the opposite. We want to keep the smallest (the deepest)
        }
        // If this element contains an already seen one, we will skip this element and keep the child
        if (
          rect.left <= sRect.left &&
          rect.top <= sRect.top &&
          rect.right >= sRect.right &&
          rect.bottom >= sRect.bottom
        ) {
          dominated = true;
          break;
        }
      }
      if (dominated) return;

      const text = htmlEl.textContent?.trim().slice(0, 100) || "";
      // Skip elements without text (probably decorative)
      if (!text && tag !== "a") return;

      seen.add(el);
      results.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
        text: text.replace(/\s+/g, " ").slice(0, 80),
        tag,
      });
    });

    // Sort: largest elements first (cards are usually large)
    results.sort((a, b) => (b.width * b.height) - (a.width * a.height));

    // Deduplicate by area (two elements in the same place = redundant click)
    const deduped: typeof results = [];
    for (const r of results) {
      const overlap = deduped.some(
        (d) =>
          Math.abs(d.x - r.x) < 30 &&
          Math.abs(d.y - r.y) < 30
      );
      if (!overlap) deduped.push(r);
    }

    return deduped;
  });
}

async function discoverPages(
  page: Page,
  baseUrl: string,
  additionalPages: string[] = []
): Promise<string[]> {
  const baseOrigin = new URL(baseUrl).origin;
  const basePath = new URL(baseUrl).pathname;
  const discovered = new Set<string>();
  discovered.add(baseUrl);

  // Add additional pages configured by the user
  for (const p of additionalPages) {
    try {
      const fullUrl = p.startsWith("http")
        ? p
        : `${baseOrigin}${p.startsWith("/") ? "" : "/"}${p}`;
      discovered.add(fullUrl);
    } catch {}
  }

  /** Normalize a URL to origin+pathname (without query/hash) */
  const cleanUrl = (raw: string): string | null => {
    try {
      const u = new URL(raw, baseOrigin);
      if (u.origin !== baseOrigin) return null;
      if (u.pathname.match(/\.(pdf|zip|jpg|jpeg|png|gif|svg|doc|docx|xls|xlsx|css|js|woff|woff2|ttf|eot|ico)$/i)) return null;
      return u.origin + u.pathname;
    } catch {
      return null;
    }
  };

  /** Collect <a href> links from the current page */
  const collectHrefLinks = async (): Promise<string[]> => {
    try {
      return await page.evaluate((origin: string) => {
        const urls: string[] = [];
        document.querySelectorAll("a[href]").forEach((a) => {
          try {
            const url = new URL((a as HTMLAnchorElement).href);
            if (
              url.origin === origin &&
              !url.hash &&
              !url.pathname.match(/\.(pdf|zip|jpg|jpeg|png|gif|svg|doc|docx|xls|xlsx|css|js|woff|woff2)$/i)
            ) {
              urls.push(url.origin + url.pathname);
            }
          } catch {}
        });
        return [...new Set(urls)];
      }, baseOrigin);
    } catch {
      return [];
    }
  };

  // Set up the SPA navigation trap
  await setupSPANavigationTrap(page);

  // ─── Phase 1 : Collect classic <a href> links ───
  console.log("Phase 1 : Collecting <a href> links...");
  const hrefLinks = await collectHrefLinks();
  for (const link of hrefLinks) {
    if (discovered.size >= MAX_PAGES) break;
    discovered.add(link);
  }
  console.log(`   → ${discovered.size} page(s) après liens <a>`);

  // ─── Phase 2 : SPA Exploration — click and observe URL changes ───
  console.log("Phase 2 : SPA Exploration (click on interactive elements)...");

  const startUrl = page.url();
  const clickables = await findAllClickableAreas(page);
  console.log(`   → ${clickables.length} clickable elements detected`);

  for (const item of clickables) {
    if (discovered.size >= MAX_PAGES) break;

    try {
      // Ensure we are on the starting page
      const currentUrl = page.url();
      const currentClean = cleanUrl(currentUrl);
      const startClean = cleanUrl(startUrl);
      if (currentClean !== startClean) {
        console.log(`   → Returning to ${startUrl}`);
        await page.goto(startUrl, { waitUntil: "networkidle2", timeout: 15000 });
        await waitForSPAReady(page);
        await setupSPANavigationTrap(page);
      }

      // Scroll to ensure the element is visible
      await page.evaluate((y: number) => {
        window.scrollTo({ top: Math.max(0, y - 300), behavior: "instant" as ScrollBehavior });
      }, item.y);
      await new Promise((r) => setTimeout(r, 200));

      // Reset the trap
      await page.evaluate(() => { (window as any).__lastSpaNav = null; });

      console.log(`   Click on "${item.text.slice(0, 50)}" (${item.tag}, ${Math.round(item.width)}x${Math.round(item.height)})...`);

      // Click by coordinates (more reliable than CSS selector)
      await page.mouse.click(item.x, item.y);

      // Wait a bit for React to navigate
      await new Promise((r) => setTimeout(r, 1500));
      await waitForSPAReady(page, 3000);

      // Check if the URL has changed (either via the trap or page.url())
      const newPageUrl = page.url();
      const spaNav = await getLastSPANavigation(page);

      const urlToCheck = spaNav || newPageUrl;
      const cleaned = cleanUrl(urlToCheck);

      if (cleaned && cleaned !== startClean && !discovered.has(cleaned)) {
        console.log(`   New SPA page: ${cleaned}`);
        discovered.add(cleaned);

        // Reinstall the trap (the page has changed)
        await setupSPANavigationTrap(page);

        const subLinks = await collectHrefLinks();
        for (const link of subLinks) {
          if (discovered.size >= MAX_PAGES) break;
          discovered.add(link);
        }
      } else if (cleaned && cleaned !== startClean && discovered.has(cleaned)) {
        console.log(`   Known page: ${cleaned}`);
      }
    } catch (err) {
      console.warn(`   Click error: ${(err as Error).message?.slice(0, 80)}`);
    }
  }

  console.log(`   → ${discovered.size} page(s) after SPA exploration`);

  // Bonus: try clicking on some elements in the discovered pages (level 2)
  console.log("Phase 3: Exploration of discovered pages...");
  const firstLevel = [...discovered];
  for (const pageUrl of firstLevel) {
    if (discovered.size >= MAX_PAGES) break;
    if (pageUrl === baseUrl) continue;

    try {
      await page.goto(pageUrl, { waitUntil: "networkidle2", timeout: 15000 });
      await waitForSPAReady(page, 4000);
      await setupSPANavigationTrap(page);

      const links = await collectHrefLinks();
      for (const link of links) {
        if (discovered.size >= MAX_PAGES) break;
        discovered.add(link);
      }

      // Try clicking on a few elements in this page as well (but only the top 5 to avoid explosion)
      const subClickables = await findAllClickableAreas(page);
      const subToClick = subClickables.slice(0, 5);

      for (const item of subToClick) {
        if (discovered.size >= MAX_PAGES) break;
        try {
          const beforeUrl = cleanUrl(page.url());
          await page.evaluate(() => { (window as any).__lastSpaNav = null; });

          await page.evaluate((y: number) => {
            window.scrollTo({ top: Math.max(0, y - 300), behavior: "instant" as ScrollBehavior });
          }, item.y);
          await new Promise((r) => setTimeout(r, 200));

          await page.mouse.click(item.x, item.y);
          await new Promise((r) => setTimeout(r, 1500));
          await waitForSPAReady(page, 3000);

          const spaNav = await getLastSPANavigation(page);
          const afterUrl = cleanUrl(spaNav || page.url());

          if (afterUrl && afterUrl !== beforeUrl && !discovered.has(afterUrl)) {
            console.log(`   Level 2 page: ${afterUrl}`);
            discovered.add(afterUrl);
          }

          // Go back
          if (afterUrl !== beforeUrl) {
            try {
              await page.goBack({ waitUntil: "networkidle2", timeout: 5000 });
              await waitForSPAReady(page, 2000);
              await setupSPANavigationTrap(page);
            } catch {
              await page.goto(pageUrl, { waitUntil: "networkidle2", timeout: 15000 });
              await waitForSPAReady(page, 2000);
              await setupSPANavigationTrap(page);
            }
          }
        } catch {}
      }
    } catch (err) {
      console.warn(`   Error on page ${pageUrl}: ${(err as Error).message?.slice(0, 60)}`);
    }
  }

  console.log(`${discovered.size} page(s) discovered in total`);
  return Array.from(discovered);
}

// ─── AUDIT OF A PAGE ───
interface PageAxeResults {
  pageInfo: IPageAudit;
  violations: any[];
  passes: any[];
  inapplicable: any[];
}

async function auditSinglePage(
  page: Page,
  url: string
): Promise<PageAxeResults> {
  console.log(`  Auditing: ${url}`);

  try {
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: PAGE_TIMEOUT,
    });

    await waitForSPAReady(page, 5000);

    const title = await page.title();

    const axeResults = await new AxePuppeteer(page)
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
      .analyze();

    return {
      pageInfo: {
        url,
        title: title || url,
        status: "success",
        violationsCount: axeResults.violations.length,
        passesCount: axeResults.passes.length,
      },
      violations: axeResults.violations,
      passes: axeResults.passes,
      inapplicable: axeResults.inapplicable,
    };
  } catch (error: any) {
    console.warn(`  ⚠️ Erreur sur ${url}: ${error.message}`);
    return {
      pageInfo: {
        url,
        title: url,
        status: "error",
        errorMessage: error.message,
        violationsCount: 0,
        passesCount: 0,
      },
      violations: [],
      passes: [],
      inapplicable: [],
    };
  }
}

// ─── MAIN PROCESS ───
async function runAuditProcess(
  auditId: string,
  url: string,
  auth?: IAuthConfig,
  additionalPages?: string[]
): Promise<void> {
  const audit = await Audit.findById(auditId);
  if (!audit) return;

  audit.status = "running";
  audit.startedAt = new Date();
  await audit.save();

  let browser: Browser | undefined;
  try {
    const needsAuth = auth?.enabled === true;

    browser = await puppeteer.launch({
      headless: needsAuth ? false : true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        ...(needsAuth ? ["--start-maximized"] : []),
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      ...(needsAuth && { defaultViewport: null }),
    });

    const page = await browser.newPage();
    if (!needsAuth) {
      await page.setViewport({ width: 1280, height: 720 });
    }

    // ─── STEP 1: Interactive authentication if configured ───
    if (needsAuth) {
      const loginUrl = auth.loginUrl || url;
      console.log(`Opening browser for authentication: ${loginUrl}`);

      await page.goto(loginUrl, {
        waitUntil: "networkidle2",
        timeout: PAGE_TIMEOUT,
      });

      // Set status to waiting-auth so the frontend displays the button
      audit.status = "waiting-auth";
      await audit.save();

      console.log("Waiting for authentication confirmation...");


      // Block here until the user confirms via the API
      await waitForAuthConfirmation(auditId);

      console.log("Authentication confirmed by the user");
      audit.status = "running";
      await audit.save();
    }

    // ─── STEP 2: Navigate to the main URL ───
    console.log(`Navigating to the main URL: ${url}`);
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: PAGE_TIMEOUT,
    });

    await waitForSPAReady(page, 5000);

    // ─── STEP 3: Discover pages ───
    const pagesToAudit = await discoverPages(
      page,
      url,
      additionalPages || []
    );
    console.log(`${pagesToAudit.length} page(s) to audit`);

    // ─── STEP 4: Audit each page ───
    const allViolations: any[] = [];
    const allPasses: any[] = [];
    const allInapplicable: any[] = [];
    const pagesAudited: IPageAudit[] = [];

    for (const pageUrl of pagesToAudit) {
      const result = await auditSinglePage(page, pageUrl);
      pagesAudited.push(result.pageInfo);

      for (const v of result.violations) {
        allViolations.push({ ...v, pageUrl });
      }
      allPasses.push(...result.passes);
      allInapplicable.push(...result.inapplicable);
    }

    // ─── STEP 5: Map to RGAA criteria ───
    const criteriaMap = new Map<string, ICriteriaAudit>();

    for (const criteria of audit.criteria) {
      criteriaMap.set(criteria.id, {
        id: criteria.id,
        thematique: criteria.thematique,
        critere: criteria.critere,
        level: criteria.level,
        result: "non-testé",
        details: [],
        wcagMapping: criteria.wcagMapping,
      });
    }

    for (const violation of allViolations) {
      const rgaaCriteria = findRGAAByAxeRule(violation.id);
      for (const rgaa of rgaaCriteria) {
        const existing = criteriaMap.get(rgaa.id);
        if (existing) {
          existing.result = "non-conforme";
          const pageLabel = violation.pageUrl
            ? `[${new URL(violation.pageUrl).pathname}]`
            : "";
          const nodeDetails = violation.nodes
            .slice(0, 5)
            .map(
              (n: any) =>
                `${pageLabel} [${violation.impact?.toUpperCase()}] ${violation.help} — ${n.html.substring(0, 150)}`
            );
          existing.details.push(...nodeDetails);
        }
      }
    }

    for (const pass of allPasses) {
      const rgaaCriteria = findRGAAByAxeRule(pass.id);
      for (const rgaa of rgaaCriteria) {
        const existing = criteriaMap.get(rgaa.id);
        if (existing && existing.result === "non-testé") {
          existing.result = "conforme";
          existing.details.push(`✓ ${pass.help}`);
        }
      }
    }

    for (const inapplicable of allInapplicable) {
      const rgaaCriteria = findRGAAByAxeRule(inapplicable.id);
      for (const rgaa of rgaaCriteria) {
        const existing = criteriaMap.get(rgaa.id);
        if (existing && existing.result === "non-testé") {
          existing.result = "non-applicable";
        }
      }
    }

    // ─── STEP 6: Calculate summary ───
    const criteriaArray = Array.from(criteriaMap.values());

    const total = criteriaArray.length;
    const conforme = criteriaArray.filter(
      (c) => c.result === "conforme"
    ).length;
    const nonConforme = criteriaArray.filter(
      (c) => c.result === "non-conforme"
    ).length;
    const nonApplicable = criteriaArray.filter(
      (c) => c.result === "non-applicable"
    ).length;
    const nonTeste = criteriaArray.filter(
      (c) => c.result === "non-testé"
    ).length;

    const applicable = total - nonApplicable;
    const tauxConformite =
      applicable > 0 ? Math.round((conforme / applicable) * 100) : 0;

    // Deduplicate violations by id+pageUrl
    const uniqueViolations = new Map<string, any>();
    for (const v of allViolations) {
      const key = `${v.id}::${v.pageUrl || ""}`;
      if (!uniqueViolations.has(key)) {
        uniqueViolations.set(key, v);
      }
    }

    audit.criteria = criteriaArray as any;
    audit.pagesAudited = pagesAudited as any;
    audit.summary = {
      total,
      conforme,
      nonConforme,
      nonApplicable,
      nonTeste,
      tauxConformite,
      pagesCount: pagesAudited.filter((p) => p.status === "success").length,
    };
    audit.rawViolations = Array.from(uniqueViolations.values()).map((v) => ({
      id: v.id,
      impact: v.impact || "unknown",
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      pageUrl: v.pageUrl,
      nodes: v.nodes.slice(0, 10).map((n: any) => ({
        html: n.html.substring(0, 300),
        target: n.target as string[],
        failureSummary: n.failureSummary || "",
      })),
    }));
    audit.status = "completed";
    audit.completedAt = new Date();
    await audit.save();

    const successPages = pagesAudited.filter(
      (p) => p.status === "success"
    ).length;
    console.log(
      `Audit ${auditId} completed — ${successPages}/${pagesAudited.length} page(s) audited — Compliance rate: ${tauxConformite}%`
    );
  } catch (error: any) {
    audit.status = "error";
    audit.errorMessage = error.message || "Erreur inconnue";
    audit.completedAt = new Date();
    await audit.save();
    console.error(`Audit ${auditId} error:`, error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
