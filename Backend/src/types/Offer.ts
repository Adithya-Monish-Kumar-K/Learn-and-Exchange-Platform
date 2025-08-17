import { Types } from "mongoose";

export interface IOffer {
  task: string | Types.ObjectId;
  offeredBy: string | Types.ObjectId;
  description: string;
  valueType: "service" | "skill" | "asset" | "other";
  valueDetail?: string;
  assets?: (string | Types.ObjectId)[];
  status?: "pending" | "accepted" | "declined" | "withdrawn";
  acceptedBy?: string | Types.ObjectId;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
