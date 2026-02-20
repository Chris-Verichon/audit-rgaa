export interface IAuthConfig {
  enabled: boolean;
  loginUrl?: string;
}

// ─── USER & AUTH ───

export type UserRole = "admin" | "user";
export type OrganisationType = "entreprise" | "particulier";

export interface IUser {
  _id?: string;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  organisation: OrganisationType;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserPublic {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  organisation: OrganisationType;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

// ─── PROJECT ───

export interface IProject {
  _id?: string;
  name: string;
  description: string;
  url: string;
  auth?: IAuthConfig;
  pages?: string[];
  createdBy?: string;
  allowedUsers?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type AuditStatus = "pending" | "running" | "waiting-auth" | "completed" | "error";

export type CriteriaResult = "conforme" | "non-conforme" | "non-applicable" | "non-testé";

export interface ICriteriaAudit {
  id: string;
  thematique: string;
  critere: string;
  level: "A" | "AA" | "AAA";
  result: CriteriaResult;
  details: string[];
  wcagMapping: string[];
}

export interface IPageAudit {
  url: string;
  title: string;
  status: "success" | "error";
  errorMessage?: string;
  violationsCount: number;
  passesCount: number;
}

export interface IAudit {
  _id?: string;
  projectId: string;
  status: AuditStatus;
  url: string;
  startedAt?: Date;
  completedAt?: Date;
  pagesAudited: IPageAudit[];
  summary?: {
    total: number;
    conforme: number;
    nonConforme: number;
    nonApplicable: number;
    nonTeste: number;
    tauxConformite: number;
    pagesCount: number;
  };
  criteria: ICriteriaAudit[];
  rawViolations?: Array<{
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
  }>;
  errorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RGAACriteria {
  id: string;
  thematique: string;
  critere: string;
  level: "A" | "AA" | "AAA";
  wcagCriteria: string[];
  tests: string[];
}
