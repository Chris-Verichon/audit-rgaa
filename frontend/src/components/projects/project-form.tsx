import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCreateProject } from "@/hooks/use-projects";
import { Loader2, Lock, Plus, X } from "lucide-react";

export function ProjectForm() {
  const navigate = useNavigate();
  const createProject = useCreateProject();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");

  // Auth
  const [authEnabled, setAuthEnabled] = useState(false);
  const [loginUrl, setLoginUrl] = useState("");

  // Pages additionnelles
  const [additionalPages, setAdditionalPages] = useState<string[]>([]);
  const [newPage, setNewPage] = useState("");

  const addPage = () => {
    const trimmed = newPage.trim();
    if (trimmed && !additionalPages.includes(trimmed)) {
      setAdditionalPages([...additionalPages, trimmed]);
      setNewPage("");
    }
  };

  const removePage = (index: number) => {
    setAdditionalPages(additionalPages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || !url.trim()) {
      toast.error("Tous les champs sont requis");
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error("URL invalide. Vérifiez le format (ex: https://example.com)");
      return;
    }

    try {
      const project = await createProject.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        url: url.trim(),
        ...(authEnabled && {
          auth: {
            enabled: true,
            loginUrl: loginUrl.trim() || undefined,
          },
        }),
        ...(additionalPages.length > 0 && { pages: additionalPages }),
      });

      toast.success("Projet créé avec succès !");
      navigate({ to: "/projects/$projectId", params: { projectId: project.id } });
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création du projet");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nouveau projet</CardTitle>
          <CardDescription>
            Créez un projet pour lancer un audit d'accessibilité RGAA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du projet</Label>
              <Input
                id="name"
                placeholder="Mon site web"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description du site à auditer..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL principale</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                L'URL de la page d'accueil du site (après connexion si
                authentification activée)
              </p>
            </div>

            {/* ─── PAGES ADDITIONNELLES ─── */}
            <div className="space-y-3">
              <Label>Pages à auditer (optionnel)</Label>
              <p className="text-xs text-muted-foreground">
                L'outil découvrira automatiquement les liens internes, mais vous
                pouvez aussi ajouter des URLs spécifiques à auditer.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="/ma-page ou https://example.com/page"
                  value={newPage}
                  onChange={(e) => setNewPage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPage();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addPage}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {additionalPages.length > 0 && (
                <div className="space-y-1">
                  {additionalPages.map((page, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded border px-3 py-1.5 text-sm bg-muted"
                    >
                      <span className="truncate">{page}</span>
                      <button
                        type="button"
                        onClick={() => removePage(i)}
                        className="ml-2 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ─── AUTHENTIFICATION ─── */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Label
                    htmlFor="auth-toggle"
                    className="cursor-pointer font-medium"
                  >
                    Authentification requise
                  </Label>
                </div>
                <input
                  id="auth-toggle"
                  type="checkbox"
                  checked={authEnabled}
                  onChange={(e) => setAuthEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>

              {authEnabled && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-muted-foreground">
                    🔐 Au lancement de l'audit, un navigateur s'ouvrira sur la
                    page de login. Connectez-vous manuellement, puis confirmez
                    dans l'application pour continuer l'audit.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="loginUrl">
                      URL de la page de login (optionnel)
                    </Label>
                    <Input
                      id="loginUrl"
                      type="url"
                      placeholder="https://example.com/login"
                      value={loginUrl}
                      onChange={(e) => setLoginUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Si vide, l'URL principale sera utilisée
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createProject.isPending}
            >
              {createProject.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Créer le projet"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
