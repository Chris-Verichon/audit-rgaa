import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
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

  // Connexion BDD
  await connectDB();

  // Routes
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
