import mongoose, { Schema, Document, Model } from 'mongoose';
import { IReview } from '../types/review';

export interface IReviewDocument extends IReview, Document {}
export interface IReviewModel extends Model<IReviewDocument> {}

const ReviewSchema: Schema<IReviewDocument> = new Schema(
  {
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 30,
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    response: {
      type: String,
      maxlength: [1000, 'Response cannot exceed 1000 characters'],
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'team_only'],
      default: 'public',
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const Review: IReviewModel = mongoose.model<IReviewDocument, IReviewModel>('Review', ReviewSchema);

export default Review;
