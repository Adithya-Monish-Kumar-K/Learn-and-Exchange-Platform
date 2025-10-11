import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAsset extends Document {
  url: string;
  publicId?: string;
  resourceType?: string;
  uploadedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    resourceType: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Asset = mongoose.models.Asset || mongoose.model<IAsset>('Asset', assetSchema);
export default Asset;
