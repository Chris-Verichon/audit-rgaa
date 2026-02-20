import { useState, useEffect } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { useProject } from "@/hooks/use-projects";
import {
  useProjectAudits,
  useStartAudit,
  useAudit,
  useAuditStatus,
  useConfirmAuth,
} from "@/hooks/use-audits";
import { useUsers, useUpdateProjectPermissions } from "@/hooks/use-users";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { AuditReport } from "@/components/audit/audit-report";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Play,
  ExternalLink,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  LogIn,
  Users,
  UserPlus,
  UserMinus,
} from "lucide-react";

function StatusBadge({ status, t }: { status: string; t: any }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          {t.ProjectDetail.statusCompleted}
        </Badge>
      );
    case "running":
      return (
        <Badge variant="default" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          {t.ProjectDetail.statusRunning}
        </Badge>
      );
    case "waiting-auth":
      return (
        <Badge variant="warning" className="gap-1">
          <Lock className="h-3 w-3" />
          {t.ProjectDetail.statusWaitingAuth}
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" />
          {t.ProjectDetail.statusPending}
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          {t.ProjectDetail.statusError}
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function ProjectDetailPage() {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: audits, isLoading: auditsLoading } = useProjectAudits(projectId);
  const startAudit = useStartAudit();
  const confirmAuth = useConfirmAuth();
  const { user: currentUser, isAdmin } = useAuth();
  const { t, locale } = useI18n();
  const { data: allUsers } = useUsers();
  const updatePermissions = useUpdateProjectPermissions();

  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [runningAuditId, setRunningAuditId] = useState<string | null>(null);

  const { data: auditStatusData } = useAuditStatus(
    runningAuditId || "",
    !!runningAuditId
  );

  useEffect(() => {
    if (
      auditStatusData?.status === "completed" ||
      auditStatusData?.status === "error"
    ) {
      setSelectedAuditId(runningAuditId);
      setRunningAuditId(null);

      if (auditStatusData.status === "completed") {
        toast.success(t.ProjectDetail.auditCompleted);
      } else {
        toast.error(
          t.ProjectDetail.auditError(auditStatusData.errorMessage || "")
        );
      }
    }
  }, [auditStatusData?.status, runningAuditId]);

  const { data: selectedAudit, isLoading: auditLoading } = useAudit(
    selectedAuditId || ""
  );

  const handleStartAudit = async () => {
    try {
      const result = await startAudit.mutateAsync(projectId);
      setRunningAuditId(result.auditId);
      toast.info(t.ProjectDetail.auditStarted);
    } catch (error: any) {
      toast.error(error.message || t.ProjectDetail.auditStartError);
    }
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive">{t.ProjectDetail.notFound}</p>
        <Link to="/">
          <Button variant="link" className="mt-4">
            {t.ProjectDetail.backToDashboard}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/">
        <Button variant="ghost" size="sm" className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          {t.ProjectDetail.back}
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <CardDescription className="mt-1">
                {project.description}
              </CardDescription>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
              >
                <ExternalLink className="h-3 w-3" />
                {project.url}
              </a>
              {project.auth?.enabled && (
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1 ml-3">
                  <Lock className="h-3 w-3" />
                  {t.ProjectDetail.authConfigured}
                </p>
              )}
              {project.pages && project.pages.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t.ProjectDetail.additionalPages(project.pages.length)}
                </p>
              )}
            </div>
            <Button
              onClick={handleStartAudit}
              disabled={startAudit.isPending || !!runningAuditId}
              className="gap-2"
            >
              {startAudit.isPending || runningAuditId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {runningAuditId ? t.ProjectDetail.auditRunning : t.ProjectDetail.launching}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {t.ProjectDetail.startAudit}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {runningAuditId && auditStatusData?.status === "waiting-auth" && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <LogIn className="h-8 w-8 text-amber-600 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <p className="font-medium text-amber-900">
                  {t.ProjectDetail.authRequired}
                </p>
                <p className="text-sm text-amber-700">
                  {t.ProjectDetail.authRequiredDescription}
                </p>
                <Button
                  onClick={async () => {
                    try {
                      await confirmAuth.mutateAsync(runningAuditId);
                      toast.success(
                        t.ProjectDetail.authConfirmed
                      );
                    } catch (error: any) {
                      toast.error(
                        error.message || t.ProjectDetail.authConfirmError
                      );
                    }
                  }}
                  disabled={confirmAuth.isPending}
                  className="gap-2 mt-1"
                  variant="default"
                >
                  {confirmAuth.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.ProjectDetail.confirming}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      {t.ProjectDetail.authConfirmButton}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {runningAuditId && auditStatusData?.status !== "waiting-auth" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">{t.ProjectDetail.auditInProgress}</p>
                <p className="text-sm text-blue-700">
                  {t.ProjectDetail.auditInProgressDescription}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!auditsLoading && audits && audits.length > 0 && !selectedAuditId && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{t.ProjectDetail.previousAudits}</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {audits.map((audit) => (
              <Card
                key={audit.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedAuditId(audit.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(audit.createdAt).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      {audit.summary && (
                        <div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t.ProjectDetail.compliance} : {audit.summary.tauxConformite}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.ProjectDetail.pagesAudited(audit.summary.pagesCount || 0)}
                          </p>
                        </div>
                      )}
                    </div>
                    <StatusBadge status={audit.status} t={t} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedAuditId && (
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedAuditId(null)}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.ProjectDetail.backToAudits}
          </Button>

          {auditLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedAudit ? (
            <AuditReport audit={selectedAudit} />
          ) : (
            <p className="text-center text-muted-foreground">
              {t.ProjectDetail.auditNotFound}
            </p>
          )}
        </div>
      )}

      {/* Gestion des habilitations — visible pour l'admin ou le créateur */}
      {project &&
        (isAdmin || project.createdBy === currentUser?.id) &&
        !selectedAuditId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t.ProjectDetail.permissions}
              </CardTitle>
              <CardDescription>
                {t.ProjectDetail.permissionsDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allUsers && allUsers.length > 0 ? (
                <div className="space-y-2">
                  {allUsers
                    .filter((u) => u.id !== project.createdBy)
                    .map((u) => {
                      const isAllowed =
                        project.allowedUsers?.includes(u.id) || false;

                      return (
                        <div
                          key={u.id}
                          className="flex items-center justify-between rounded-lg border px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                              {u.prenom[0]}
                              {u.nom[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {u.prenom} {u.nom}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {u.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant={isAllowed ? "destructive" : "outline"}
                            size="sm"
                            className="gap-1"
                            disabled={updatePermissions.isPending}
                            onClick={async () => {
                              const current = project.allowedUsers || [];
                              const newList = isAllowed
                                ? current.filter((id) => id !== u.id)
                                : [...current, u.id];

                              try {
                                await updatePermissions.mutateAsync({
                                  projectId: project.id,
                                  allowedUsers: newList,
                                });
                                toast.success(
                                  isAllowed
                                    ? t.ProjectDetail.accessRemoved(u.prenom)
                                    : t.ProjectDetail.accessGranted(u.prenom)
                                );
                              } catch (error: any) {
                                toast.error(error.message);
                              }
                            }}
                          >
                            {isAllowed ? (
                              <>
                                <UserMinus className="h-3 w-3" />
                                {t.ProjectDetail.remove}
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-3 w-3" />
                                {t.ProjectDetail.authorize}
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t.ProjectDetail.noOtherUsers}
                </p>
              )}
            </CardContent>
          </Card>
        )}
    </div>
  );
}
