import { Types } from "mongoose";

export interface ITask {
  title: string;
  description: string;
  postedBy: string | Types.ObjectId;
  offer: string;
  requirements: string[];
  status?: "open" | "in_progress" | "completed" | "cancelled";
  applicants?: (string | Types.ObjectId)[];
  assignedTo?: string | Types.ObjectId;
  deadline?: Date;
  attachments?: (string | Types.ObjectId)[];
  createdAt?: Date;
  updatedAt?: Date;
}
