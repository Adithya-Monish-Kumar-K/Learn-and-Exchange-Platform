import { Types } from 'mongoose';

export interface IReview {
  reviewer: string | Types.ObjectId;
  reviewee: string | Types.ObjectId;
  task?: string | Types.ObjectId;
  title?: string;
  rating: number;
  comment: string;
  tags?: string[];
  isAnonymous?: boolean;
  response?: string;
  visibility?: 'public' | 'private' | 'team_only';
  likes?: (string | Types.ObjectId)[];
  createdAt?: Date;
  updatedAt?: Date;
}
