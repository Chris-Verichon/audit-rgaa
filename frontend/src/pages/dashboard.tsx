import { Link } from "@tanstack/react-router";
import { useProjects } from "@/hooks/use-projects";
import { ProjectCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FolderOpen } from "lucide-react";

export function DashboardPage() {
  const { data: projects, isLoading, error } = useProjects();

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
          Erreur lors du chargement des projets : {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Gérez vos projets et audits d'accessibilité RGAA
          </p>
        </div>
        <Link to="/projects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau projet
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
            <h3 className="text-lg font-semibold">Aucun projet</h3>
            <p className="text-muted-foreground">
              Créez votre premier projet pour lancer un audit RGAA
            </p>
          </div>
          <Link to="/projects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer un projet
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
