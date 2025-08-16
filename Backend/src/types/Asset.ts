import { Types } from "mongoose";

export interface IAsset {
  owner: string | Types.ObjectId;
  url: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}