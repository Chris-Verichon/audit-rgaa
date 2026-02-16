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
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Terminé
        </Badge>
      );
    case "running":
      return (
        <Badge variant="default" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          En cours
        </Badge>
      );
    case "waiting-auth":
      return (
        <Badge variant="warning" className="gap-1">
          <Lock className="h-3 w-3" />
          Authentification
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" />
          En attente
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Erreur
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
        toast.success("Audit terminé !");
      } else {
        toast.error(
          `Erreur : ${auditStatusData.errorMessage || "Erreur inconnue"}`
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
      toast.info("Audit lancé ! Cela peut prendre quelques instants...");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du lancement de l'audit");
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
        <p className="text-destructive">Projet introuvable</p>
        <Link to="/">
          <Button variant="link" className="mt-4">
            Retour au dashboard
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
          Retour
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
                  Authentification configurée
                </p>
              )}
              {project.pages && project.pages.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {project.pages.length} page(s) additionnelle(s) configurée(s)
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
                  {runningAuditId ? "Audit en cours..." : "Lancement..."}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Lancer un audit
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
                  Authentification requise
                </p>
                <p className="text-sm text-amber-700">
                  Un navigateur s'est ouvert. Connectez-vous sur le site, puis
                  cliquez sur le bouton ci-dessous pour continuer l'audit.
                </p>
                <Button
                  onClick={async () => {
                    try {
                      await confirmAuth.mutateAsync(runningAuditId);
                      toast.success(
                        "Authentification confirmée ! L'audit continue..."
                      );
                    } catch (error: any) {
                      toast.error(
                        error.message || "Erreur lors de la confirmation"
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
                      Confirmation...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      J'ai terminé la connexion
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
                <p className="font-medium text-blue-900">Audit en cours...</p>
                <p className="text-sm text-blue-700">
                  Découverte des pages et analyse de l'accessibilité.
                  Cela peut prendre quelques minutes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!auditsLoading && audits && audits.length > 0 && !selectedAuditId && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Audits précédents</h3>
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
                        {new Date(audit.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      {audit.summary && (
                        <div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Conformité : {audit.summary.tauxConformite}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {audit.summary.pagesCount || 0} page(s) auditée(s)
                          </p>
                        </div>
                      )}
                    </div>
                    <StatusBadge status={audit.status} />
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
            Retour aux audits
          </Button>

          {auditLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedAudit ? (
            <AuditReport audit={selectedAudit} />
          ) : (
            <p className="text-center text-muted-foreground">
              Audit introuvable
            </p>
          )}
        </div>
      )}
    </div>
  );
}
