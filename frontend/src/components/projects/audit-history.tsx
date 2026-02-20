import { useI18n } from "@/hooks/use-i18n";
import { StatusBadge } from "@/components/audit/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AuditListItem } from "@/types";

interface AuditHistoryProps {
  audits: AuditListItem[];
  onSelectAudit: (auditId: string) => void;
}

export function AuditHistory({ audits, onSelectAudit }: AuditHistoryProps) {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{t.ProjectDetail.previousAudits}</h3>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {audits.map((audit) => (
          <Card
            key={audit.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectAudit(audit.id)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {new Date(audit.createdAt).toLocaleDateString(
                      locale === "fr" ? "fr-FR" : "en-US",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                  {audit.summary && (
                    <div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.ProjectDetail.compliance} :{" "}
                        {audit.summary.tauxConformite}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.ProjectDetail.pagesAudited(
                          audit.summary.pagesCount || 0
                        )}
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
  );
}
