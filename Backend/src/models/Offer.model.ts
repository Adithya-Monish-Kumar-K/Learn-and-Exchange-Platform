import mongoose, { Schema, Document, Model } from "mongoose";
import { IOffer } from "../types/Offer";

export interface IOfferDocument extends IOffer, Document {}
export interface IOfferModel extends Model<IOfferDocument> {}

const OfferSchema: Schema<IOfferDocument> = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    offeredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Offer description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
      trim: true,
    },
    valueType: {
      type: String,
      enum: ["service", "skill", "asset", "other"],
      default: "other",
      required: true,
    },
    valueDetail: {
      type: String,
      maxlength: 300,
      trim: true,
    },
    assets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Asset",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "withdrawn"],
      default: "pending",
      index: true,
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

OfferSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $exists: true } } });

const Offer: IOfferModel = mongoose.model<IOfferDocument, IOfferModel>("Offer", OfferSchema);
const samp = 1;
export default Offer;
