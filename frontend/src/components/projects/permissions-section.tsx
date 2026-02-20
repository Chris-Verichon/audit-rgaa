import { toast } from "sonner";
import { useUsers, useUpdateProjectPermissions } from "@/hooks/use-users";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, UserPlus, UserMinus } from "lucide-react";
import type { Project } from "@/types";

interface PermissionsSectionProps {
  project: Project;
}

export function PermissionsSection({ project }: PermissionsSectionProps) {
  const { t } = useI18n();
  const { data: allUsers } = useUsers();
  const updatePermissions = useUpdateProjectPermissions();

  return (
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
  );
}
