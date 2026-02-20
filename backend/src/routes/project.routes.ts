import type { FastifyInstance } from "fastify";
import { Project } from "../models/project.model.js";
import { authenticate } from "../middleware/auth.middleware.js";

export async function projectRoutes(app: FastifyInstance) {
  // All project routes require authentication
  app.addHook("preHandler", authenticate);

  // GET /api/projects — List projects (admin: all, user: own + authorized)
  app.get("/api/projects", async (request, reply) => {
    const user = request.currentUser!;

    let projects;
    if (user.role === "admin") {
      projects = await Project.find().sort({ createdAt: -1 });
    } else {
      projects = await Project.find({
        $or: [
          { createdBy: user.id },
          { allowedUsers: user.id },
        ],
      }).sort({ createdAt: -1 });
    }

    return reply.send(projects);
  });

  // GET /api/projects/:id — Project detail (with access verification)
  app.get<{ Params: { id: string } }>(
    "/api/projects/:id",
    async (request, reply) => {
      const project = await Project.findById(request.params.id);
      if (!project) {
        return reply.status(404).send({ error: "Projet introuvable" });
      }

      const user = request.currentUser!;
      if (
        user.role !== "admin" &&
        project.createdBy !== user.id &&
        !project.allowedUsers?.includes(user.id)
      ) {
        return reply.status(403).send({ error: "Accès interdit à ce projet" });
      }

      return reply.send(project);
    }
  );

  // POST /api/projects — Create a new project
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

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return reply.status(400).send({ error: "URL invalide" });
    }

    const project = new Project({
      name,
      description,
      url,
      auth,
      pages,
      createdBy: request.currentUser!.id,
      allowedUsers: [],
    });
    await project.save();
    return reply.status(201).send(project);
  });

  // PUT /api/projects/:id — Update a project
  app.put<{
    Params: { id: string };
    Body: {
      name?: string;
      description?: string;
      url?: string;
      allowedUsers?: string[];
    };
  }>("/api/projects/:id", async (request, reply) => {
    const existing = await Project.findById(request.params.id);
    if (!existing) {
      return reply.status(404).send({ error: "Projet introuvable" });
    }

    const user = request.currentUser!;
    if (user.role !== "admin" && existing.createdBy !== user.id) {
      return reply
        .status(403)
        .send({ error: "Seuls l'admin ou le créateur peuvent modifier ce projet" });
    }

    const project = await Project.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true, runValidators: true }
    );

    return reply.send(project);
  });

  // DELETE /api/projects/:id — Delete a project
  app.delete<{ Params: { id: string } }>(
    "/api/projects/:id",
    async (request, reply) => {
      const existing = await Project.findById(request.params.id);
      if (!existing) {
        return reply.status(404).send({ error: "Projet introuvable" });
      }

      const user = request.currentUser!;
      if (user.role !== "admin" && existing.createdBy !== user.id) {
        return reply
          .status(403)
          .send({ error: "Seuls l'admin ou le créateur peuvent supprimer ce projet" });
      }

      await Project.findByIdAndDelete(request.params.id);
      return reply.send({ message: "Projet supprimé" });
    }
  );
}
