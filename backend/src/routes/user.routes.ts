import type { FastifyInstance } from "fastify";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../services/auth.service.js";
import type { UserRole } from "../types/index.js";

export async function userRoutes(app: FastifyInstance) {
  // Toutes les routes users nécessitent une authentification
  app.addHook("preHandler", authenticate);

  // GET /api/users — Liste de tous les utilisateurs (admin uniquement)
  app.get(
    "/api/users",
    { preHandler: [requireRole("admin")] },
    async (_request, reply) => {
      const users = await getAllUsers();
      return reply.send(users);
    }
  );

  // GET /api/users/:id — Détail d'un utilisateur (admin uniquement)
  app.get<{ Params: { id: string } }>(
    "/api/users/:id",
    { preHandler: [requireRole("admin")] },
    async (request, reply) => {
      const user = await getUserById(request.params.id);
      if (!user) {
        return reply.status(404).send({ error: "Utilisateur introuvable" });
      }
      return reply.send(user);
    }
  );

  // PUT /api/users/:id/role — Modifier le rôle d'un utilisateur (admin uniquement)
  app.put<{ Params: { id: string }; Body: { role: UserRole } }>(
    "/api/users/:id/role",
    { preHandler: [requireRole("admin")] },
    async (request, reply) => {
      const { role } = request.body;

      if (!role || !["admin", "user"].includes(role)) {
        return reply
          .status(400)
          .send({ error: "Le rôle doit être 'admin' ou 'user'" });
      }

      // Empêcher un admin de se retirer son propre rôle admin
      if (
        request.params.id === request.currentUser!.id &&
        role !== "admin"
      ) {
        return reply
          .status(400)
          .send({ error: "Vous ne pouvez pas retirer votre propre rôle admin" });
      }

      const user = await updateUserRole(request.params.id, role);
      if (!user) {
        return reply.status(404).send({ error: "Utilisateur introuvable" });
      }

      return reply.send(user);
    }
  );

  // DELETE /api/users/:id — Supprimer un utilisateur (admin uniquement)
  app.delete<{ Params: { id: string } }>(
    "/api/users/:id",
    { preHandler: [requireRole("admin")] },
    async (request, reply) => {
      // Empêcher un admin de se supprimer lui-même
      if (request.params.id === request.currentUser!.id) {
        return reply
          .status(400)
          .send({ error: "Vous ne pouvez pas supprimer votre propre compte" });
      }

      const deleted = await deleteUser(request.params.id);
      if (!deleted) {
        return reply.status(404).send({ error: "Utilisateur introuvable" });
      }

      return reply.send({ message: "Utilisateur supprimé" });
    }
  );
}
