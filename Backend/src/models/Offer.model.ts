import mongoose, { Schema, Document, Model } from "mongoose";
import { IOffer } from "../types/Offer";

export interface IOfferDocument extends IOffer, Document {
  // Virtual properties
  summary: {
    id: mongoose.Types.ObjectId;
    valueType: string;
    valueDetail?: string;
    status: string;
    createdAt: Date;
    expiresAt?: Date;
  };
  isExpired: boolean;
  daysUntilExpiry: number | null;
  
  // Instance methods
  canUserModify(userId: string | mongoose.Types.ObjectId): boolean;
  withdraw(): Promise<IOfferDocument>;
  accept(userId: string | mongoose.Types.ObjectId): Promise<IOfferDocument>;
}

export interface IOfferModel extends Model<IOfferDocument> {
  getByStatus(status: string): Promise<IOfferDocument[]>;
  getActiveOffersForTask(taskId: string | mongoose.Types.ObjectId): Promise<IOfferDocument[]>;
}

const OfferSchema: Schema<IOfferDocument> = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task reference is required"],
      index: true,
    },
    offeredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Offer creator is required"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Offer description is required"],
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      trim: true,
    },
    valueType: {
      type: String,
      required: [true, "Value type is required"],
      enum: {
        values: ["service", "skill", "asset", "other"],
        message: "Value type must be one of: service, skill, asset, other",
      },
    },
    valueDetail: {
      type: String,
      maxlength: [500, "Value detail cannot exceed 500 characters"],
      trim: true,
    },
    assets: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "declined", "withdrawn"],
        message: "Status must be one of: pending, accepted, declined, withdrawn",
      },
      default: "pending",
      index: true,
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    acceptedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      default: function () {
        // Default expiry: 30 days from creation
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      },
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    estimatedDelivery: {
      type: Date,
    },
    terms: {
      type: String,
      maxlength: [1000, "Terms cannot exceed 1000 characters"],
    },
    attachments: [
      {
        filename: String,
        url: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    feedback: {
      rating: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"],
      },
      comment: {
        type: String,
        maxlength: [1000, "Feedback comment cannot exceed 1000 characters"],
      },
      givenBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      givenAt: {
        type: Date,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for offer summary
OfferSchema.virtual("summary").get(function (this: IOfferDocument) {
  return {
    id: this._id,
    valueType: this.valueType,
    valueDetail: this.valueDetail,
    status: this.status,
    createdAt: this.createdAt,
    expiresAt: this.expiresAt,
  };
});

// Virtual to check if offer is expired
OfferSchema.virtual("isExpired").get(function (this: IOfferDocument) {
  return this.expiresAt ? this.expiresAt < new Date() : false;
});

// Virtual to get days until expiry
OfferSchema.virtual("daysUntilExpiry").get(function (this: IOfferDocument) {
  if (!this.expiresAt) return null;
  const now = new Date();
  const diffTime = this.expiresAt.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes for better query performance
OfferSchema.index({ task: 1, offeredBy: 1 });
OfferSchema.index({ offeredBy: 1, status: 1 });
OfferSchema.index({ valueType: 1, status: 1 });
OfferSchema.index({ createdAt: -1 });
OfferSchema.index({ expiresAt: 1 });

// Compound index for efficient filtering
OfferSchema.index({
  status: 1,
  valueType: 1,
  createdAt: -1,
});

// Text index for search functionality
OfferSchema.index({
  description: "text",
  valueDetail: "text",
});

// TTL index for automatic expiration
OfferSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { expiresAt: { $exists: true } },
  }
);

// Pre-save middleware to handle status changes
OfferSchema.pre("save", function (next) {
  // Set acceptedAt when status changes to accepted
  if (this.isModified("status") && this.status === "accepted" && !this.acceptedAt) {
    this.acceptedAt = new Date();
  }

  // Validate that acceptedBy is set when status is accepted
  if (this.status === "accepted" && !this.acceptedBy) {
    return next(new Error("acceptedBy is required when status is accepted"));
  }

  next();
});

// Static method to get offers by status
OfferSchema.statics.getByStatus = function (status: string) {
  return this.find({ status, isActive: true });
};

// Static method to get active offers for a task
OfferSchema.statics.getActiveOffersForTask = function (
  taskId: string | mongoose.Types.ObjectId
) {
  return this.find({
    task: taskId,
    status: { $in: ["pending", "accepted"] },
    isActive: true,
  }).populate("offeredBy", "name avatar rating level");
};

// Instance method to check if user can modify offer
OfferSchema.methods.canUserModify = function (
  this: IOfferDocument,
  userId: string | mongoose.Types.ObjectId
) {
  return (
    this.offeredBy.toString() === userId.toString() && this.status === "pending"
  );
};

// Instance method to withdraw offer
OfferSchema.methods.withdraw = function (this: IOfferDocument) {
  if (this.status !== "pending") {
    throw new Error("Only pending offers can be withdrawn");
  }
  this.status = "withdrawn";
  return this.save();
};

// Instance method to accept offer
OfferSchema.methods.accept = function (
  this: IOfferDocument,
  userId: string | mongoose.Types.ObjectId
) {
  if (this.status !== "pending") {
    throw new Error("Only pending offers can be accepted");
  }
  this.status = "accepted";
  this.acceptedBy = userId as mongoose.Types.ObjectId;
  this.acceptedAt = new Date();
  return this.save();
};

const Offer: IOfferModel = mongoose.model<IOfferDocument, IOfferModel>(
  "Offer",
  OfferSchema
);

export default Offer;
