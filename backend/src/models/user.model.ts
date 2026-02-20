import mongoose, { Schema, Document } from "mongoose";
import type { IUser } from "../types/index.js";

export interface UserDocument extends Omit<IUser, "_id">, Document {}

const userSchema = new Schema<UserDocument>(
  {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    organisation: {
      type: String,
      enum: ["entreprise", "particulier"],
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

export const User = mongoose.model<UserDocument>("User", userSchema);
