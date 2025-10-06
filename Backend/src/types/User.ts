import { Types } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "user" | "admin";
  bio?: string;
  skills?: { name: string; level?: string; years?: number }[];
  qualifications?: { title: string; institution: string; year: number }[];
  projects?: { title: string; description: string; link?: string }[];
  experience?: { company: string; role: string; duration: string; description?: string }[];
  certifications?: (string | Types.ObjectId)[];
  links?: string[];
  recommendations?: { fromUser: (string | Types.ObjectId); message: string; date: Date }[];
  tasksPosted?: (string | Types.ObjectId)[];
  tasksCompleted?: (string | Types.ObjectId)[];
  resume?: (string | Types.ObjectId);
  profileImage?: (string | Types.ObjectId);
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}
