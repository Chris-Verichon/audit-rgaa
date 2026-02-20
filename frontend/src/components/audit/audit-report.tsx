import type { Audit } from "@/types";
import { AuditSummaryCard } from "./audit-summary";
import { CriteriaGroup } from "./criteria-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, ExternalLink } from "lucide-react";
import { getAuditPDFUrl } from "@/lib/api";
import { useI18n } from "@/hooks/use-i18n";

interface AuditReportProps {
  audit: Audit;
}

export function AuditReport({ audit }: AuditReportProps) {
  const { t, locale } = useI18n();
  // Grouper les critères par thématique
  const groupedCriteria = new Map<string, typeof audit.criteria>();
  for (const criteria of audit.criteria) {
    const group = groupedCriteria.get(criteria.thematique) || [];
    group.push(criteria);
    groupedCriteria.set(criteria.thematique, group);
  }

  const handleDownloadPDF = () => {
    window.open(getAuditPDFUrl(audit.id), "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header du rapport */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.AuditReport.title}</h2>
          <p className="text-sm text-muted-foreground">
            {t.AuditReport.auditDate}{" "}
            {audit.completedAt
              ? new Date(audit.completedAt).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A"}
          </p>
        </div>
        <Button onClick={handleDownloadPDF} className="gap-2">
          <Download className="h-4 w-4" />
          {t.AuditReport.downloadPdf}
        </Button>
      </div>

      {/* Résumé */}
      {audit.summary && (
        <AuditSummaryCard
          summary={audit.summary}
          pagesAudited={audit.pagesAudited}
        />
      )}

      {/* Contenu en tabs */}
      <Tabs defaultValue="criteria" className="space-y-4">
        <TabsList>
          <TabsTrigger value="criteria">{t.AuditReport.rgaaCriteria}</TabsTrigger>
          <TabsTrigger value="violations">
            {t.AuditReport.violationsDetected(audit.rawViolations?.length || 0)}
          </TabsTrigger>
        </TabsList>

        {/* Onglet Critères */}
        <TabsContent value="criteria">
          <Accordion type="multiple" className="space-y-2">
            {Array.from(groupedCriteria.entries()).map(
              ([thematique, criteria], index) => (
                <CriteriaGroup
                  key={thematique}
                  thematique={thematique}
                  criteria={criteria}
                  index={index + 1}
                />
              )
            )}
          </Accordion>
        </TabsContent>

        {/* Onglet Violations */}
        <TabsContent value="violations">
          <div className="space-y-4">
            {audit.rawViolations && audit.rawViolations.length > 0 ? (
              audit.rawViolations.map((violation) => (
                <Card key={`${violation.id}-${violation.pageUrl || ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">
                        {violation.help}
                      </CardTitle>
                      <Badge
                        variant={
                          violation.impact === "critical"
                            ? "destructive"
                            : violation.impact === "serious"
                              ? "destructive"
                              : "warning"
                        }
                      >
                        {violation.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {violation.description}
                    </p>
                    {violation.pageUrl && (
                      <p className="text-xs text-blue-600 mt-1">
                        📄 {t.AuditReport.page} : {new URL(violation.pageUrl).pathname}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <a
                      href={violation.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mb-3"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {t.AuditReport.learnMore}
                    </a>
                    <div className="space-y-2">
                      {violation.nodes.slice(0, 5).map((node, i) => (
                        <div
                          key={i}
                          className="rounded border bg-muted p-3"
                        >
                          <code className="text-xs break-all block">
                            {node.html}
                          </code>
                          {node.failureSummary && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {node.failureSummary}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {t.AuditReport.noViolations}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
