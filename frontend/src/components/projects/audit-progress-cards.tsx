import { toast } from "sonner";
import { useConfirmAuth } from "@/hooks/use-audits";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, LogIn } from "lucide-react";

interface AuthWaitingCardProps {
  auditId: string;
}

export function AuthWaitingCard({ auditId }: AuthWaitingCardProps) {
  const { t } = useI18n();
  const confirmAuth = useConfirmAuth();

  return (
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
                  await confirmAuth.mutateAsync(auditId);
                  toast.success(t.ProjectDetail.authConfirmed);
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
  );
}

export function AuditRunningCard() {
  const { t } = useI18n();

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">
              {t.ProjectDetail.auditInProgress}
            </p>
            <p className="text-sm text-blue-700">
              {t.ProjectDetail.auditInProgressDescription}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
