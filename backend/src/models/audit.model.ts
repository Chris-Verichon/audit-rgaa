import mongoose, { Schema, Document } from "mongoose";
import type { IAudit } from "../types/index.js";

export interface AuditDocument extends Omit<IAudit, "_id">, Document {}

const criteriaAuditSchema = new Schema(
  {
    id: { type: String, required: true },
    thematique: { type: String, required: true },
    critere: { type: String, required: true },
    level: { type: String, enum: ["A", "AA", "AAA"], required: true },
    result: {
      type: String,
      enum: ["conforme", "non-conforme", "non-applicable", "non-testé"],
      default: "non-testé",
    },
    details: [{ type: String }],
    wcagMapping: [{ type: String }],
  },
  { _id: false }
);

const pageAuditSchema = new Schema(
  {
    url: { type: String, required: true },
    title: { type: String, default: "" },
    status: {
      type: String,
      enum: ["success", "error"],
      default: "success",
    },
    errorMessage: { type: String },
    violationsCount: { type: Number, default: 0 },
    passesCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const auditSchema = new Schema<AuditDocument>(
  {
    projectId: {
      type: String,
      required: true,
      ref: "Project",
    },
    status: {
      type: String,
      enum: ["pending", "running", "waiting-auth", "completed", "error"],
      default: "pending",
    },
    url: { type: String, required: true },
    startedAt: { type: Date },
    completedAt: { type: Date },
    pagesAudited: [pageAuditSchema],
    summary: {
      total: { type: Number, default: 0 },
      conforme: { type: Number, default: 0 },
      nonConforme: { type: Number, default: 0 },
      nonApplicable: { type: Number, default: 0 },
      nonTeste: { type: Number, default: 0 },
      tauxConformite: { type: Number, default: 0 },
      pagesCount: { type: Number, default: 0 },
    },
    criteria: [criteriaAuditSchema],
    rawViolations: [{ type: Schema.Types.Mixed }],
    errorMessage: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Audit = mongoose.model<AuditDocument>("Audit", auditSchema);
