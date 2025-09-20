import { Types } from "mongoose";

export interface IUser {
  username: string;
  name?: string;

  email: string;
  phone: string;
  password: string;
  role: "user" | "admin";

  bio?: string;
  skills?: string[];
  links?: string[];
  experience?: string[];
  certifications?: (string | Types.ObjectId)[];
  credit?: number;

  tasksPosted?: (string | Types.ObjectId)[];
  tasksCompleted?: (string | Types.ObjectId)[];
  resume?: (string | Types.ObjectId);
  profileImage?: (string | Types.ObjectId);
  isActive?: boolean;
  isVerified?: boolean;
  reviews?: (string | Types.ObjectId)[];
  createdAt?: Date;
  updatedAt?: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}
