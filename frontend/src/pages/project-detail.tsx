import { useState, useEffect } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { useProject } from "@/hooks/use-projects";
import {
  useProjectAudits,
  useStartAudit,
  useAudit,
  useAuditStatus,
} from "@/hooks/use-audits";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { AuditReport } from "@/components/audit/audit-report";
import { AuditHistory } from "@/components/projects/audit-history";
import {
  AuthWaitingCard,
  AuditRunningCard,
} from "@/components/projects/audit-progress-cards";
import { PermissionsSection } from "@/components/projects/permissions-section";
import { Button } from "@/components/ui/button";
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
  Lock,
} from "lucide-react";

export function ProjectDetailPage() {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: audits, isLoading: auditsLoading } = useProjectAudits(projectId);
  const startAudit = useStartAudit();
  const { user: currentUser, isAdmin } = useAuth();
  const { t } = useI18n();

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
        <AuthWaitingCard auditId={runningAuditId} />
      )}

      {runningAuditId && auditStatusData?.status !== "waiting-auth" && (
        <AuditRunningCard />
      )}

      {!auditsLoading && audits && audits.length > 0 && !selectedAuditId && (
        <AuditHistory
          audits={audits}
          onSelectAudit={setSelectedAuditId}
        />
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

      {project &&
        (isAdmin || project.createdBy === currentUser?.id) &&
        !selectedAuditId && (
          <PermissionsSection project={project} />
        )}
    </div>
  );
}
