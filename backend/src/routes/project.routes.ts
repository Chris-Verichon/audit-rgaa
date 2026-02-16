import type { FastifyInstance } from "fastify";
import { Project } from "../models/project.model.js";

export async function projectRoutes(app: FastifyInstance) {
  // GET /api/projects — Liste de tous les projets
  app.get("/api/projects", async (_request, reply) => {
    const projects = await Project.find().sort({ createdAt: -1 });
    return reply.send(projects);
  });

  // GET /api/projects/:id — Détail d'un projet
  app.get<{ Params: { id: string } }>(
    "/api/projects/:id",
    async (request, reply) => {
      const project = await Project.findById(request.params.id);
      if (!project) {
        return reply.status(404).send({ error: "Projet introuvable" });
      }
      return reply.send(project);
    }
  );

  // POST /api/projects — Créer un nouveau projet
  app.post<{
    Body: {
      name: string;
      description: string;
      url: string;
      auth?: {
        enabled: boolean;
        loginUrl?: string;
      };
      pages?: string[];
    };
  }>("/api/projects", async (request, reply) => {
    const { name, description, url, auth, pages } = request.body;

    if (!name || !description || !url) {
      return reply
        .status(400)
        .send({ error: "Nom, description et URL sont requis" });
    }

    // Validation basique de l'URL
    try {
      new URL(url);
    } catch {
      return reply.status(400).send({ error: "URL invalide" });
    }

    const project = new Project({ name, description, url, auth, pages });
    await project.save();
    return reply.status(201).send(project);
  });

  // PUT /api/projects/:id — Modifier un projet
  app.put<{
    Params: { id: string };
    Body: { name?: string; description?: string; url?: string };
  }>("/api/projects/:id", async (request, reply) => {
    const project = await Project.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return reply.status(404).send({ error: "Projet introuvable" });
    }

    return reply.send(project);
  });

  // DELETE /api/projects/:id — Supprimer un projet
  app.delete<{ Params: { id: string } }>(
    "/api/projects/:id",
    async (request, reply) => {
      const project = await Project.findByIdAndDelete(request.params.id);
      if (!project) {
        return reply.status(404).send({ error: "Projet introuvable" });
      }
      return reply.send({ message: "Projet supprimé" });
    }
  );
}
