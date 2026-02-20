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
import { useI18n } from "@/hooks/use-i18n";
import { Loader2, Lock, Plus, X } from "lucide-react";

export function ProjectForm() {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const { t } = useI18n();

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
      toast.error(t.ProjectForm.validationAllFieldsRequired);
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error(t.ProjectForm.validationInvalidUrl);
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

      toast.success(t.ProjectForm.toastSuccess);
      navigate({ to: "/projects/$projectId", params: { projectId: project.id } });
    } catch (error: any) {
      toast.error(error.message || t.ProjectForm.toastError);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.ProjectForm.title}</CardTitle>
          <CardDescription>
            {t.ProjectForm.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t.ProjectForm.projectNameLabel}</Label>
              <Input
                id="name"
                placeholder={t.ProjectForm.projectNamePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t.ProjectForm.descriptionLabel}</Label>
              <Textarea
                id="description"
                placeholder={t.ProjectForm.descriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">{t.ProjectForm.urlLabel}</Label>
              <Input
                id="url"
                type="url"
                placeholder={t.ProjectForm.urlPlaceholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                {t.ProjectForm.urlDescription}
              </p>
            </div>

            {/* ─── PAGES ADDITIONNELLES ─── */}
            <div className="space-y-3">
              <Label>{t.ProjectForm.additionalPagesLabel}</Label>
              <p className="text-xs text-muted-foreground">
                {t.ProjectForm.additionalPagesDescription}
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder={t.ProjectForm.additionalPagesPlaceholder}
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
                    {t.ProjectForm.authRequired}
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
                    {t.ProjectForm.authDescription}
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="loginUrl">
                      {t.ProjectForm.loginUrlLabel}
                    </Label>
                    <Input
                      id="loginUrl"
                      type="url"
                      placeholder={t.ProjectForm.loginUrlPlaceholder}
                      value={loginUrl}
                      onChange={(e) => setLoginUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t.ProjectForm.loginUrlDescription}
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
                  {t.ProjectForm.submitting}
                </>
              ) : (
                t.ProjectForm.submit
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
