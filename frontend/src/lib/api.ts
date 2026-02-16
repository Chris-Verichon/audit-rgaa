import type {
  Project,
  CreateProjectInput,
  Audit,
  AuditListItem,
} from "@/types";

const API_BASE = "/api";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...options?.headers as Record<string, string> };

  // Only set Content-Type for requests that have a body
  if (options?.body) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erreur inconnue" }));
    throw new Error(error.error || `Erreur HTTP ${response.status}`);
  }

  return response.json();
}

// ─── PROJECTS ───

export async function getProjects(): Promise<Project[]> {
  return fetchJSON<Project[]>("/projects");
}

export async function getProject(id: string): Promise<Project> {
  return fetchJSON<Project>(`/projects/${id}`);
}

export async function createProject(data: CreateProjectInput): Promise<Project> {
  return fetchJSON<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await fetchJSON(`/projects/${id}`, { method: "DELETE" });
}

// ─── AUDITS ───

export async function getProjectAudits(projectId: string): Promise<AuditListItem[]> {
  return fetchJSON<AuditListItem[]>(`/projects/${projectId}/audits`);
}

export async function startAudit(
  projectId: string
): Promise<{ auditId: string; status: string }> {
  return fetchJSON(`/projects/${projectId}/audits`, { method: "POST" });
}

export async function confirmAuth(
  auditId: string
): Promise<{ message: string }> {
  return fetchJSON(`/audits/${auditId}/confirm-auth`, { method: "POST" });
}

export async function getAudit(auditId: string): Promise<Audit> {
  return fetchJSON<Audit>(`/audits/${auditId}`);
}

export async function getAuditStatus(
  auditId: string
): Promise<{ status: string; summary?: Audit["summary"]; errorMessage?: string }> {
  return fetchJSON(`/audits/${auditId}/status`);
}

export async function deleteAudit(auditId: string): Promise<void> {
  await fetchJSON(`/audits/${auditId}`, { method: "DELETE" });
}

export function getAuditPDFUrl(auditId: string): string {
  return `${API_BASE}/audits/${auditId}/pdf`;
}
