import { Link } from "@tanstack/react-router";
import { useProjects } from "@/hooks/use-projects";
import { ProjectCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FolderOpen } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

export function DashboardPage() {
  const { data: projects, isLoading, error } = useProjects();
  const { t } = useI18n();

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
          {t.Dashboard.errorLoading(error.message)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.Dashboard.title}</h1>
          <p className="text-muted-foreground">
            {t.Dashboard.subtitle}
          </p>
        </div>
        <Link to="/projects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t.Dashboard.newProject}
          </Button>
        </Link>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 space-y-4">
          <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/50" />
          <div>
            <h3 className="text-lg font-semibold">{t.Dashboard.noProjects}</h3>
            <p className="text-muted-foreground">
              {t.Dashboard.noProjectsDescription}
            </p>
          </div>
          <Link to="/projects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t.Dashboard.createProject}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
