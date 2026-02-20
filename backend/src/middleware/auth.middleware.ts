import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { JwtPayload, UserRole } from "../types/index.js";

// Extend Fastify request with user data
declare module "fastify" {
  interface FastifyRequest {
    currentUser?: JwtPayload;
  }
}

/**
 * Hook d'authentification — vérifie le JWT et attache l'utilisateur à la requête
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const decoded = await request.jwtVerify<JwtPayload>();
    request.currentUser = decoded;
  } catch (err) {
    return reply.status(401).send({ error: "Non authentifié" });
  }
}

/**
 * Hook d'autorisation par rôle — vérifie que l'utilisateur a le rôle requis
 */
export function requireRole(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.currentUser) {
      return reply.status(401).send({ error: "Non authentifié" });
    }

    if (!roles.includes(request.currentUser.role)) {
      return reply
        .status(403)
        .send({ error: "Accès interdit — rôle insuffisant" });
    }
  };
}
