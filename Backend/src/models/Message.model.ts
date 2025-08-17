import { Schema, model, Types, Document } from 'mongoose';

export interface IMessage {
  senderId: Types.ObjectId;
  text: string;
  timestamp: Date;
}

export interface IChat extends Document {
  participants: Types.ObjectId[];
  listingId: Types.ObjectId;
  offerId: Types.ObjectId;
  messages: IMessage[];
  lastUpdated: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: () => new Date() }
  },
  { _id: false }
);

const chatSchema = new Schema<IChat>(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: 'User', required: true }
    ],
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true
    },
    offerId: {
      type: Schema.Types.ObjectId,
      ref: 'Offer',
      required: true
    },
    messages: [messageSchema],
    lastUpdated: { type: Date, default: () => new Date() }
  },
  { timestamps: true }
);

export default model<IChat>('Chat', chatSchema);
