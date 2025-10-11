import mongoose, { Schema, Document, Model } from 'mongoose';

const supportTicketSchema = new Schema({
  requestType: { type: String, required: true },
  request: { type: String, required: true },
  requestBy: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  closedBy: { type: String },
  media: { type: [String], default: [] }
}, { timestamps: true });

export const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);