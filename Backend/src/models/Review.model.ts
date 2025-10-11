import mongoose, { Schema, Document, Model } from 'mongoose';

// Review Schema
const reviewSchema = new Schema({
  reviewer: { type: String, required: true },
  reviewee: { type: String, required: true },
  task: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  tags: { type: [String], default: [] },
  likes: { type: Number, default: 0 },
  response: { type: String }
}, { timestamps: true });

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

// SupportTicket Schema
const supportTicketSchema = new Schema({
  requestType: { type: String, required: true },
  request: { type: String, required: true },
  requestBy: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  closedBy: { type: String },
  media: { type: [String], default: [] }
}, { timestamps: true });

export const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);

// Task Schema
const taskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

// User Schema
const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
