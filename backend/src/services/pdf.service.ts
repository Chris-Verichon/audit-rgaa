import PDFDocument from "pdfkit";
import type { IAudit, IPageAudit } from "../types/index.js";
import type { PassThrough } from "stream";

interface AuditWithProject extends IAudit {
  projectName?: string;
  projectDescription?: string;
}

export function generatePDF(audit: AuditWithProject): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: `Rapport RGAA - ${audit.projectName || "Audit"}`,
      Author: "Audit RGAA App",
      Subject: "Rapport d'accessibilité RGAA",
    },
  });

  const colors = {
    primary: "#00205b",
    success: "#37AD24",
    danger: "#FF4949",
    warning: "#D9642C",
    gray: "#6b7280",
    lightGray: "#f3f4f6",
    dark: "#111827",
  };

  // ─── Page title ───
  doc.moveDown(6);
  doc
    .fontSize(28)
    .fillColor(colors.primary)
    .text("Rapport d'audit", { align: "center" });
  doc
    .fontSize(28)
    .text("d'accessibilité RGAA", { align: "center" });
  doc.moveDown(2);

  doc
    .fontSize(18)
    .fillColor(colors.dark)
    .text(audit.projectName || "Projet", { align: "center" });
  doc.moveDown(1);

  if (audit.projectDescription) {
    doc
      .fontSize(12)
      .fillColor(colors.gray)
      .text(audit.projectDescription, { align: "center" });
    doc.moveDown(1);
  }

  doc
    .fontSize(12)
    .fillColor(colors.gray)
    .text(`URL : ${audit.url}`, { align: "center" });
  doc.moveDown(0.5);
  doc.text(
    `Date : ${audit.completedAt ? new Date(audit.completedAt).toLocaleDateString("fr-FR") : "N/A"}`,
    { align: "center" }
  );

  // ─── Summary ───
  doc.addPage();
  doc
    .fontSize(22)
    .fillColor(colors.primary)
    .text("Résumé de l'audit", { underline: true });
  doc.moveDown(1);

  if (audit.summary) {
    const { total, conforme, nonConforme, nonApplicable, nonTeste, tauxConformite } =
      audit.summary;

    // Percentage of compliance
    doc
      .fontSize(42)
      .fillColor(
        tauxConformite >= 75
          ? colors.success
          : tauxConformite >= 50
            ? colors.warning
            : colors.danger
      )
      .text(`${tauxConformite}%`, { align: "center" });
    doc
      .fontSize(14)
      .fillColor(colors.gray)
      .text("Taux de conformité", { align: "center" });
    doc.moveDown(2);

    // Summary details
    const summaryData = [
      { label: "Total des critères", value: total.toString() },
      { label: "Conformes", value: conforme.toString() },
      { label: "Non conformes", value: nonConforme.toString() },
      { label: "Non applicables", value: nonApplicable.toString() },
      { label: "Non testés", value: nonTeste.toString() },
      { label: "Pages auditées", value: (audit.summary?.pagesCount || 0).toString() },
    ];

    for (const item of summaryData) {
      doc.fontSize(12).fillColor(colors.dark).text(item.label, 50, undefined, {
        continued: true,
        width: 300,
      });
      doc.text(item.value, { align: "right" });
      doc.moveDown(0.5);
    }
  }

  // ─── Audited Pages ───
  if (audit.pagesAudited && audit.pagesAudited.length > 0) {
    doc.addPage();
    doc
      .fontSize(22)
      .fillColor(colors.primary)
      .text("Pages auditées", { underline: true });
    doc.moveDown(1);
    doc
      .fontSize(12)
      .fillColor(colors.dark)
      .text(
        `${audit.pagesAudited.filter((p) => p.status === "success").length} page(s) auditée(s) avec succès sur ${audit.pagesAudited.length} découverte(s).`
      );
    doc.moveDown(1);

    for (const page of audit.pagesAudited) {
      if (doc.y > 700) doc.addPage();

      const statusIcon = page.status === "success" ? "✓" : "✗";
      const statusColor =
        page.status === "success" ? colors.success : colors.danger;

      doc
        .fontSize(11)
        .fillColor(statusColor)
        .text(statusIcon, 50, undefined, { continued: true });
      doc
        .fillColor(colors.dark)
        .text(` ${page.title}`, { continued: false });
      doc
        .fontSize(9)
        .fillColor(colors.gray)
        .text(`  ${page.url}`, 65);

      if (page.status === "success") {
        doc
          .fontSize(9)
          .fillColor(colors.gray)
          .text(
            `  ${page.violationsCount} violation(s) | ${page.passesCount} test(s) réussi(s)`,
            65
          );
      } else if (page.errorMessage) {
        doc
          .fontSize(9)
          .fillColor(colors.danger)
          .text(`  Erreur: ${page.errorMessage.substring(0, 100)}`, 65);
      }

      doc.moveDown(0.5);
    }
  }

  // ─── Details by Theme ───
  doc.addPage();
  doc
    .fontSize(22)
    .fillColor(colors.primary)
    .text("Détails par thématique", { underline: true });
  doc.moveDown(1);

  const groupedCriteria = new Map<string, typeof audit.criteria>();
  for (const criteria of audit.criteria) {
    const group = groupedCriteria.get(criteria.thematique) || [];
    group.push(criteria);
    groupedCriteria.set(criteria.thematique, group);
  }

  let themeIndex = 0;
  for (const [thematique, criteria] of groupedCriteria) {
    themeIndex++;

    if (doc.y > 650) {
      doc.addPage();
    }

    // Theme title
    const confCount = criteria.filter((c) => c.result === "conforme").length;
    const ncCount = criteria.filter((c) => c.result === "non-conforme").length;

    doc
      .fontSize(16)
      .fillColor(colors.primary)
      .text(`${themeIndex}. ${thematique}`, { underline: false });
    doc
      .fontSize(10)
      .fillColor(colors.gray)
      .text(
        `${confCount} conforme(s) | ${ncCount} non conforme(s) | ${criteria.length} critère(s)`
      );
    doc.moveDown(0.5);

    for (const crit of criteria) {
      if (doc.y > 700) {
        doc.addPage();
      }

      const resultColor =
        crit.result === "conforme"
          ? colors.success
          : crit.result === "non-conforme"
            ? colors.danger
            : crit.result === "non-applicable"
              ? colors.gray
              : colors.warning;

      const resultLabel = crit.result.toUpperCase();

      doc.fontSize(10).fillColor(resultColor).text(`[${resultLabel}]`, 60, undefined, {
        continued: true,
      });
      doc
        .fillColor(colors.dark)
        .text(` ${crit.id} — ${crit.critere}`, { indent: 10 });

      // Show details for non-conform criteria
      if (crit.result === "non-conforme" && crit.details.length > 0) {
        for (const detail of crit.details.slice(0, 3)) {
          doc
            .fontSize(8)
            .fillColor(colors.gray)
            .text(`  → ${detail.substring(0, 200)}`, 80);
        }
      }

      doc.moveDown(0.3);
    }

    doc.moveDown(1);
  }

  // ─── Methodology ───
  doc.addPage();
  doc
    .fontSize(22)
    .fillColor(colors.primary)
    .text("Méthodologie", { underline: true });
  doc.moveDown(1);
  doc
    .fontSize(11)
    .fillColor(colors.dark)
    .text(
      "Cet audit a été réalisé automatiquement à l'aide de l'outil axe-core, " +
        "qui effectue des tests automatisés sur les critères WCAG 2.1 (niveaux A et AA). " +
        "Les résultats ont été mappés vers les 106 critères du RGAA 4.1."
    );
  doc.moveDown(1);
  doc.moveDown(2);
  doc
    .fontSize(10)
    .fillColor(colors.gray)
    .text("Rapport généré par Audit RGAA App", { align: "center" });
  doc.text(
    `Date de génération : ${new Date().toLocaleDateString("fr-FR")}`,
    { align: "center" }
  );

  return doc;
}
