import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import type { IUserPublic, UserRole, OrganisationType } from "../types/index.js";

const SALT_ROUNDS = 10;

export interface RegisterInput {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  organisation: OrganisationType;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(
  input: RegisterInput
): Promise<IUserPublic> {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new Error("Un compte avec cet email existe déjà");
  }

  const hashedPassword = await hashPassword(input.password);

  // The first registered user automatically becomes admin
  const userCount = await User.countDocuments();
  const role: UserRole = userCount === 0 ? "admin" : "user";

  const user = new User({
    nom: input.nom.trim(),
    prenom: input.prenom.trim(),
    email: input.email.toLowerCase().trim(),
    password: hashedPassword,
    organisation: input.organisation,
    role,
  });

  await user.save();
  return user.toJSON() as unknown as IUserPublic;
}

export async function loginUser(
  input: LoginInput
): Promise<{ user: IUserPublic; userId: string }> {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user) {
    throw new Error("Email ou mot de passe incorrect");
  }

  const valid = await comparePassword(input.password, user.password);
  if (!valid) {
    throw new Error("Email ou mot de passe incorrect");
  }

  return {
    user: user.toJSON() as unknown as IUserPublic,
    userId: user._id.toString(),
  };
}

export async function getUserById(
  id: string
): Promise<IUserPublic | null> {
  const user = await User.findById(id);
  if (!user) return null;
  return user.toJSON() as unknown as IUserPublic;
}

export async function getAllUsers(): Promise<IUserPublic[]> {
  const users = await User.find().sort({ createdAt: -1 });
  return users.map((u) => u.toJSON() as unknown as IUserPublic);
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<IUserPublic | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  );
  if (!user) return null;
  return user.toJSON() as unknown as IUserPublic;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const result = await User.findByIdAndDelete(userId);
  return !!result;
}
