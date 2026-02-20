import type { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  registerUser,
  loginUser,
  getUserById,
  type RegisterInput,
  type LoginInput,
} from "../services/auth.service.js";

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/register — Créer un compte
  app.post<{ Body: RegisterInput }>(
    "/api/auth/register",
    async (request, reply) => {
      const { nom, prenom, email, password, organisation } = request.body;

      if (!nom || !prenom || !email || !password || !organisation) {
        return reply
          .status(400)
          .send({ error: "Tous les champs sont requis" });
      }

      if (password.length < 6) {
        return reply
          .status(400)
          .send({ error: "Le mot de passe doit contenir au moins 6 caractères" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return reply.status(400).send({ error: "Email invalide" });
      }

      if (!["entreprise", "particulier"].includes(organisation)) {
        return reply
          .status(400)
          .send({ error: "L'organisation doit être 'entreprise' ou 'particulier'" });
      }

      try {
        const user = await registerUser({
          nom,
          prenom,
          email,
          password,
          organisation,
        });

        const token = app.jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          { expiresIn: "7d" }
        );

        return reply.status(201).send({ user, token });
      } catch (error: any) {
        return reply.status(409).send({ error: error.message });
      }
    }
  );

  // POST /api/auth/login — Se connecter
  app.post<{ Body: LoginInput }>(
    "/api/auth/login",
    async (request, reply) => {
      const { email, password } = request.body;

      if (!email || !password) {
        return reply
          .status(400)
          .send({ error: "Email et mot de passe requis" });
      }

      try {
        const { user, userId } = await loginUser({ email, password });

        const token = app.jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          { expiresIn: "7d" }
        );

        return reply.send({ user, token });
      } catch (error: any) {
        return reply.status(401).send({ error: error.message });
      }
    }
  );

  // GET /api/auth/me — Récupérer l'utilisateur connecté
  app.get(
    "/api/auth/me",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = await getUserById(request.currentUser!.id);
      if (!user) {
        return reply.status(404).send({ error: "Utilisateur introuvable" });
      }
      return reply.send(user);
    }
  );
}
