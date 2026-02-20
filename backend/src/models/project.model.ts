import mongoose, { Schema, Document } from "mongoose";
import type { IProject } from "../types/index.js";

export interface ProjectDocument extends Omit<IProject, "_id">, Document {}

const authConfigSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    loginUrl: { type: String, trim: true },
  },
  { _id: false }
);

const projectSchema = new Schema<ProjectDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    auth: { type: authConfigSchema, default: undefined },
    pages: [{ type: String, trim: true }],
    createdBy: { type: String, ref: "User" },
    allowedUsers: [{ type: String, ref: "User" }],
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

export const Project = mongoose.model<ProjectDocument>("Project", projectSchema);
