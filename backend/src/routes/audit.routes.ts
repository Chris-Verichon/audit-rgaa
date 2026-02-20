import type { FastifyInstance } from "fastify";
import { Audit } from "../models/audit.model.js";
import { Project } from "../models/project.model.js";
import { runAudit, confirmAuth } from "../services/audit.service.js";
import { generatePDF } from "../services/pdf.service.js";
import { authenticate } from "../middleware/auth.middleware.js";

export async function auditRoutes(app: FastifyInstance) {
  // Toutes les routes audits nécessitent une authentification
  app.addHook("preHandler", authenticate);
  // POST /api/projects/:projectId/audits — Start a new audit for a project
  app.post<{ Params: { projectId: string } }>(
    "/api/projects/:projectId/audits",
    async (request, reply) => {
      const { projectId } = request.params;

      const project = await Project.findById(projectId);
      if (!project) {
        return reply.status(404).send({ error: "Projet introuvable" });
      }

      try {
        const auditId = await runAudit(projectId);
        return reply.status(201).send({ auditId, status: "pending" });
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  // GET /api/projects/:projectId/audits — List audits for a project
  app.get<{ Params: { projectId: string } }>(
    "/api/projects/:projectId/audits",
    async (request, reply) => {
      const audits = await Audit.find({
        projectId: request.params.projectId,
      })
        .select("-criteria -rawViolations")
        .sort({ createdAt: -1 });

      return reply.send(audits);
    }
  );

  // GET /api/audits/:auditId — Get details of a specific audit
  app.get<{ Params: { auditId: string } }>(
    "/api/audits/:auditId",
    async (request, reply) => {
      const audit = await Audit.findById(request.params.auditId);
      if (!audit) {
        return reply.status(404).send({ error: "Audit introuvable" });
      }
      return reply.send(audit);
    }
  );

  // GET /api/audits/:auditId/status — Get the status of a specific audit (polling)
  app.get<{ Params: { auditId: string } }>(
    "/api/audits/:auditId/status",
    async (request, reply) => {
      const audit = await Audit.findById(request.params.auditId).select(
        "status summary errorMessage startedAt completedAt"
      );

      if (!audit) {
        return reply.status(404).send({ error: "Audit introuvable" });
      }

      return reply.send(audit);
    }
  );

  // POST /api/audits/:auditId/confirm-auth — Confirm authentication for audits that require it
  app.post<{ Params: { auditId: string } }>(
    "/api/audits/:auditId/confirm-auth",
    async (request, reply) => {
      const audit = await Audit.findById(request.params.auditId);
      if (!audit) {
        return reply.status(404).send({ error: "Audit introuvable" });
      }

      if (audit.status !== "waiting-auth") {
        return reply
          .status(400)
          .send({ error: "L'audit n'attend pas de confirmation d'authentification" });
      }

      const confirmed = confirmAuth(request.params.auditId);
      if (!confirmed) {
        return reply
          .status(400)
          .send({ error: "Impossible de confirmer l'authentification" });
      }

      return reply.send({ message: "Authentification confirmée, l'audit continue" });
    }
  );

  // GET /api/audits/:auditId/pdf — Download the PDF report
  app.get<{ Params: { auditId: string } }>(
    "/api/audits/:auditId/pdf",
    async (request, reply) => {
      const audit = await Audit.findById(request.params.auditId);
      if (!audit) {
        return reply.status(404).send({ error: "Audit introuvable" });
      }

      if (audit.status !== "completed") {
        return reply
          .status(400)
          .send({ error: "L'audit n'est pas encore terminé" });
      }

      // Get project info for the PDF
      const project = await Project.findById(audit.projectId);

      const auditData = audit.toJSON();
      const pdfDoc = generatePDF({
        ...auditData,
        _id: auditData.id || audit._id.toString(),
        projectName: project?.name,
        projectDescription: project?.description,
      } as any);

      reply.header("Content-Type", "application/pdf");
      reply.header(
        "Content-Disposition",
        `attachment; filename="rapport-rgaa-${audit.projectId}-${Date.now()}.pdf"`
      );

      return reply.send(pdfDoc);
    }
  );

  // DELETE /api/audits/:auditId — Delete an audit
  app.delete<{ Params: { auditId: string } }>(
    "/api/audits/:auditId",
    async (request, reply) => {
      const audit = await Audit.findByIdAndDelete(request.params.auditId);
      if (!audit) {
        return reply.status(404).send({ error: "Audit introuvable" });
      }
      return reply.send({ message: "Audit supprimé" });
    }
  );
}
