import mongoose, { Schema, Document, Model } from "mongoose";
import { IAsset } from "../types/Asset";

export interface IAssetDocument extends IAsset, Document {}
export interface IAssetModel extends Model<IAssetDocument> {}

const AssetSchema: Schema<IAssetDocument> = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
    },
    mimeType: {
      type: String,
    },
    description: {
      type: String,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

const Asset: IAssetModel = mongoose.model<IAssetDocument, IAssetModel>(
  "Asset",
  AssetSchema
);

export default Asset;
