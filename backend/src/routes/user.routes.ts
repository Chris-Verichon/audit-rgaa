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
  // All user routes require authentication
  app.addHook("preHandler", authenticate);

  // GET /api/users — List all users (admin only)
  app.get(
    "/api/users",
    { preHandler: [requireRole("admin")] },
    async (_request, reply) => {
      const users = await getAllUsers();
      return reply.send(users);
    }
  );

  // GET /api/users/:id — User detail (admin only)
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

  // PUT /api/users/:id/role — Update a user's role (admin only)
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

      // Prevent an admin from revoking their own admin role
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

  // DELETE /api/users/:id — Delete a user (admin only)
  app.delete<{ Params: { id: string } }>(
    "/api/users/:id",
    { preHandler: [requireRole("admin")] },
    async (request, reply) => {
      // Prevent an admin from deleting themselves
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
