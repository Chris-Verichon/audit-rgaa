import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import { authRoutes } from "./routes/auth.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { projectRoutes } from "./routes/project.routes.js";
import { auditRoutes } from "./routes/audit.routes.js";

dotenv.config();

const app = Fastify({
  logger: true,
});

async function start() {
  // CORS
  await app.register(cors, {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  });

  // JWT
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "audit-rgaa-secret-key-change-in-production",
  });

  // Connexion BDD
  await connectDB();

  // Routes
  await app.register(authRoutes);
  await app.register(userRoutes);
  await app.register(projectRoutes);
  await app.register(auditRoutes);

  // Health check
  app.get("/api/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Start the server
  const port = parseInt(process.env.PORT || "3001");
  const host = process.env.HOST || "0.0.0.0";

  try {
    await app.listen({ port, host });
    console.log(`Server started on http://localhost:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
