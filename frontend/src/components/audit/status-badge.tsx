import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Loader2, Lock, XCircle } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useI18n();

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
