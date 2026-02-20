import type {
  Project,
  CreateProjectInput,
  Audit,
  AuditListItem,
  User,
  LoginInput,
  RegisterInput,
  AuthResponse,
  UserRole,
} from "@/types";

const API_BASE = "/api";

// ─── TOKEN MANAGEMENT ───

const TOKEN_KEY = "audit-rgaa-token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── FETCH WRAPPER ───

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...options?.headers as Record<string, string> };

  // Only set Content-Type for requests that have a body
  if (options?.body) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  // Automatically attach JWT token
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = "/login";
    throw new Error("Session expirée, veuillez vous reconnecter");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erreur inconnue" }));
    throw new Error(error.error || `Erreur HTTP ${response.status}`);
  }

  return response.json();
}

// ─── AUTH ───

export async function login(data: LoginInput): Promise<AuthResponse> {
  const result = await fetchJSON<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setToken(result.token);
  return result;
}

export async function register(data: RegisterInput): Promise<AuthResponse> {
  const result = await fetchJSON<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setToken(result.token);
  return result;
}

export async function getMe(): Promise<User> {
  return fetchJSON<User>("/auth/me");
}

export function logout(): void {
  removeToken();
  window.location.href = "/login";
}

// ─── USERS (admin) ───

export async function getUsers(): Promise<User[]> {
  return fetchJSON<User[]>("/users");
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<User> {
  return fetchJSON<User>(`/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}

export async function deleteUser(userId: string): Promise<void> {
  await fetchJSON(`/users/${userId}`, { method: "DELETE" });
}

// ─── PROJECT PERMISSIONS ───

export async function updateProjectAllowedUsers(
  projectId: string,
  allowedUsers: string[]
): Promise<Project> {
  return fetchJSON<Project>(`/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify({ allowedUsers }),
  });
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
