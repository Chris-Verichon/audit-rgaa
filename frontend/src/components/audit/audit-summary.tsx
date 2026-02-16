import type { AuditSummary, PageAudit } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  MinusCircle,
  HelpCircle,
  FileText,
  Globe,
  AlertTriangle,
} from "lucide-react";

interface AuditSummaryCardProps {
  summary: AuditSummary;
  pagesAudited?: PageAudit[];
}

export function AuditSummaryCard({
  summary,
  pagesAudited,
}: AuditSummaryCardProps) {
  const {
    total,
    conforme,
    nonConforme,
    nonApplicable,
    nonTeste,
    tauxConformite,
    pagesCount,
  } = summary;

  const conformiteColor =
    tauxConformite >= 75
      ? "text-green-600"
      : tauxConformite >= 50
        ? "text-yellow-600"
        : "text-red-600";

  const progressColor =
    tauxConformite >= 75
      ? "bg-green-500"
      : tauxConformite >= 50
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="space-y-6">
      {/* Taux de conformité principal */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Taux de conformité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className={`text-5xl font-bold ${conformiteColor}`}>
              {tauxConformite}%
            </span>
            <div className="flex-1">
              <Progress
                value={tauxConformite}
                className="h-3"
                indicatorClassName={progressColor}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {conforme} critères conformes sur {total - nonApplicable}{" "}
                applicables
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Détails */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {pagesCount || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Pages auditées
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{conforme}</p>
                <p className="text-xs text-muted-foreground">Conformes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{nonConforme}</p>
                <p className="text-xs text-muted-foreground">Non conformes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MinusCircle className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-2xl font-bold text-gray-500">
                  {nonApplicable}
                </p>
                <p className="text-xs text-muted-foreground">Non applicables</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{nonTeste}</p>
                <p className="text-xs text-muted-foreground">Non testés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des pages auditées */}
      {pagesAudited && pagesAudited.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pages auditées ({pagesAudited.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pagesAudited.map((page, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {page.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{page.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {page.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {page.status === "success" ? (
                      <>
                        {page.violationsCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {page.violationsCount} violation
                            {page.violationsCount > 1 ? "s" : ""}
                          </Badge>
                        )}
                        <Badge variant="success" className="text-xs">
                          {page.passesCount} OK
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Erreur
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
