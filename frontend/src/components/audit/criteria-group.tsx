import type { CriteriaAudit } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, MinusCircle, HelpCircle } from "lucide-react";

interface CriteriaGroupProps {
  thematique: string;
  criteria: CriteriaAudit[];
  index: number;
}

function getResultIcon(result: CriteriaAudit["result"]) {
  switch (result) {
    case "conforme":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "non-conforme":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "non-applicable":
      return <MinusCircle className="h-4 w-4 text-gray-400" />;
    default:
      return <HelpCircle className="h-4 w-4 text-yellow-500" />;
  }
}

function getResultBadge(result: CriteriaAudit["result"]) {
  switch (result) {
    case "conforme":
      return <Badge variant="success">Conforme</Badge>;
    case "non-conforme":
      return <Badge variant="destructive">Non conforme</Badge>;
    case "non-applicable":
      return <Badge variant="outline">N/A</Badge>;
    default:
      return <Badge variant="warning">Non testé</Badge>;
  }
}

export function CriteriaGroup({
  thematique,
  criteria,
  index,
}: CriteriaGroupProps) {
  const conforme = criteria.filter((c) => c.result === "conforme").length;
  const nonConforme = criteria.filter(
    (c) => c.result === "non-conforme"
  ).length;

  return (
    <AccordionItem value={thematique}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3 text-left">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {index}
          </span>
          <div>
            <p className="font-semibold">{thematique}</p>
            <p className="text-xs text-muted-foreground">
              {conforme} conforme{conforme > 1 ? "s" : ""} ·{" "}
              {nonConforme} non conforme{nonConforme > 1 ? "s" : ""} ·{" "}
              {criteria.length} critère{criteria.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="space-y-3 pl-11">
          {criteria.map((crit) => (
            <div
              key={crit.id}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              {getResultIcon(crit.result)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-medium text-primary">
                    {crit.id}
                  </span>
                  {getResultBadge(crit.result)}
                  <Badge variant="outline" className="text-xs">
                    {crit.level}
                  </Badge>
                </div>
                <p className="text-sm mt-1 text-foreground">{crit.critere}</p>

                {/* Détails des erreurs */}
                {crit.details.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {crit.details.slice(0, 5).map((detail, i) => (
                      <p
                        key={i}
                        className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono break-all"
                      >
                        {detail}
                      </p>
                    ))}
                    {crit.details.length > 5 && (
                      <p className="text-xs text-muted-foreground italic">
                        ... et {crit.details.length - 5} autre(s)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
