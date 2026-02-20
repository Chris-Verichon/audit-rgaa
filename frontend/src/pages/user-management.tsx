import { useAuth } from "@/hooks/use-auth";
import { useUsers, useUpdateUserRole, useDeleteUser } from "@/hooks/use-users";
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
  Shield,
  ShieldCheck,
  Trash2,
  Users,
  Building2,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/types";
import { useI18n } from "@/hooks/use-i18n";

function UserRow({ user, currentUserId }: { user: User; currentUserId: string }) {
  const { t, locale } = useI18n();
  const updateRole = useUpdateUserRole();
  const deleteUserMutation = useDeleteUser();

  const isCurrentUser = user.id === currentUserId;

  const handleToggleRole = async () => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      await updateRole.mutateAsync({ userId: user.id, role: newRole });
      toast.success(
        t.UserManagement.roleUpdated(`${user.prenom} ${user.nom}`, newRole)
      );
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        t.UserManagement.deleteConfirm(`${user.prenom} ${user.nom}`)
      )
    )
      return;

    try {
      await deleteUserMutation.mutateAsync(user.id);
      toast.success(t.UserManagement.userDeleted);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
          {user.prenom[0]}
          {user.nom[0]}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">
              {user.prenom} {user.nom}
            </p>
            {user.role === "admin" ? (
              <Badge variant="default" className="gap-1 text-xs">
                <ShieldCheck className="h-3 w-3" />
                {t.Common.admin}
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-xs">
                <UserIcon className="h-3 w-3" />
                {t.Common.user}
              </Badge>
            )}
            {isCurrentUser && (
              <Badge variant="secondary" className="text-xs">
                {t.Common.you}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            {user.organisation === "entreprise" ? (
              <Building2 className="h-3 w-3" />
            ) : (
              <UserIcon className="h-3 w-3" />
            )}
            {user.organisation === "entreprise" ? t.Common.enterprise : t.Common.individual}
            {" · "}
            {t.UserManagement.registeredOn}{" "}
            {new Date(user.createdAt).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")}
          </p>
        </div>
      </div>

      {!isCurrentUser && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleRole}
            disabled={updateRole.isPending}
            className="gap-1"
          >
            {updateRole.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Shield className="h-3 w-3" />
            )}
            {user.role === "admin" ? t.UserManagement.removeAdmin : t.UserManagement.makeAdmin}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteUserMutation.isPending}
            className="text-destructive hover:text-destructive"
          >
            {deleteUserMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const { t } = useI18n();
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive">
          {t.UserManagement.error(error.message)}
        </p>
      </div>
    );
  }

  const admins = users?.filter((u) => u.role === "admin") || [];
  const regularUsers = users?.filter((u) => u.role === "user") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          {t.UserManagement.title}
        </h1>
        <p className="text-muted-foreground">
          {t.UserManagement.subtitle}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{users?.length || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {t.UserManagement.totalUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{admins.length}</p>
                <p className="text-xs text-muted-foreground">{t.UserManagement.administrators}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{regularUsers.length}</p>
                <p className="text-xs text-muted-foreground">{t.UserManagement.users}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.UserManagement.allUsers}</CardTitle>
          <CardDescription>
            {t.UserManagement.accountsRegistered(users?.length || 0)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users?.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                currentUserId={currentUser?.id || ""}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
