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

function UserRow({ user, currentUserId }: { user: User; currentUserId: string }) {
  const updateRole = useUpdateUserRole();
  const deleteUserMutation = useDeleteUser();

  const isCurrentUser = user.id === currentUserId;

  const handleToggleRole = async () => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      await updateRole.mutateAsync({ userId: user.id, role: newRole });
      toast.success(
        `${user.prenom} ${user.nom} est maintenant ${newRole === "admin" ? "administrateur" : "utilisateur"}`
      );
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Supprimer le compte de ${user.prenom} ${user.nom} ? Cette action est irréversible.`
      )
    )
      return;

    try {
      await deleteUserMutation.mutateAsync(user.id);
      toast.success("Utilisateur supprimé");
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
                Admin
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-xs">
                <UserIcon className="h-3 w-3" />
                Utilisateur
              </Badge>
            )}
            {isCurrentUser && (
              <Badge variant="secondary" className="text-xs">
                Vous
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
            {user.organisation === "entreprise" ? "Entreprise" : "Particulier"}
            {" · "}
            Inscrit le{" "}
            {new Date(user.createdAt).toLocaleDateString("fr-FR")}
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
            {user.role === "admin" ? "Retirer admin" : "Rendre admin"}
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
          Erreur : {error.message}
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
          Gestion des utilisateurs
        </h1>
        <p className="text-muted-foreground">
          Gérez les comptes et les rôles des utilisateurs
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
                  Total utilisateurs
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
                <p className="text-xs text-muted-foreground">Administrateurs</p>
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
                <p className="text-xs text-muted-foreground">Utilisateurs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tous les utilisateurs</CardTitle>
          <CardDescription>
            {users?.length || 0} compte(s) enregistré(s)
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
