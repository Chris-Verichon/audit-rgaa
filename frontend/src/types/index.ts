export interface AuthConfig {
  enabled: boolean;
  loginUrl?: string;
}

// ─── USER & AUTH ───

export type UserRole = "admin" | "user";
export type OrganisationType = "entreprise" | "particulier";

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  organisation: OrganisationType;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  organisation: OrganisationType;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── PROJECT ───

export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  auth?: AuthConfig;
  pages?: string[];
  createdBy?: string;
  allowedUsers?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  url: string;
  auth?: AuthConfig;
  pages?: string[];
}

export type AuditStatus = "pending" | "running" | "waiting-auth" | "completed" | "error";
export type CriteriaResult = "conforme" | "non-conforme" | "non-applicable" | "non-testé";

export interface CriteriaAudit {
  id: string;
  thematique: string;
  critere: string;
  level: "A" | "AA" | "AAA";
  result: CriteriaResult;
  details: string[];
  wcagMapping: string[];
}

export interface PageAudit {
  url: string;
  title: string;
  status: "success" | "error";
  errorMessage?: string;
  violationsCount: number;
  passesCount: number;
}

export interface AuditSummary {
  total: number;
  conforme: number;
  nonConforme: number;
  nonApplicable: number;
  nonTeste: number;
  tauxConformite: number;
  pagesCount: number;
}

export interface AuditViolation {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  pageUrl?: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
}

export interface Audit {
  id: string;
  projectId: string;
  status: AuditStatus;
  url: string;
  startedAt?: string;
  completedAt?: string;
  pagesAudited: PageAudit[];
  summary?: AuditSummary;
  criteria: CriteriaAudit[];
  rawViolations?: AuditViolation[];
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditListItem {
  id: string;
  projectId: string;
  status: AuditStatus;
  url: string;
  startedAt?: string;
  completedAt?: string;
  summary?: AuditSummary;
  pagesAudited?: PageAudit[];
  createdAt: string;
}
