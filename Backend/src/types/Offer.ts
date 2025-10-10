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
  acceptedAt?: Date;
  expiresAt?: Date;
  priority?: "low" | "medium" | "high";
  estimatedDelivery?: Date;
  terms?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    fileType: string;
    uploadedAt: Date;
  }>;
  feedback?: {
    rating?: number;
    comment?: string;
    givenBy?: string | Types.ObjectId;
    givenAt?: Date;
  };
  isActive?: boolean;
  viewCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
