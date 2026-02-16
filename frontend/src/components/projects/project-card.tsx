import { Link } from "@tanstack/react-router";
import type { Project } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, ArrowRight } from "lucide-react";
import { useDeleteProject } from "@/hooks/use-projects";
import { toast } from "sonner";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const deleteProject = useDeleteProject();

  const handleDelete = async () => {
    if (!confirm("Supprimer ce projet et tous ses audits ?")) return;

    try {
      await deleteProject.mutateAsync(project.id);
      toast.success("Projet supprimé");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <CardDescription className="mt-1">
              {project.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          {project.url}
        </a>
        <p className="text-xs text-muted-foreground mt-2">
          Créé le {new Date(project.createdAt).toLocaleDateString("fr-FR")}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleteProject.isPending}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Supprimer
        </Button>

        <Link to="/projects/$projectId" params={{ projectId: project.id }}>
          <Button variant="default" size="sm">
            Voir le projet
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
