import mongoose, { Schema, model, Types, Document } from 'mongoose';

export interface IMessage {
  senderId: Types.ObjectId;
  text: string;
  type: string;
  readBy: Types.ObjectId[];
  isEdited: boolean;
  media: Types.ObjectId[];
}

export interface IChat extends Document {
  type: string;
  participants: Types.ObjectId[];
  taskId?: Types.ObjectId;
  offerId?: Types.ObjectId;
  messages: IMessage[];
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: false },
    type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isEdited: { type: Boolean, default: false },
    media: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
  },
  { _id: false, timestamps: true }
);

const chatSchema = new Schema<IChat>(
  {
    type: { type: String, enum: ['group', 'private'], default: 'private' },
    participants: [
      { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ],
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    offerId: { type: Schema.Types.ObjectId, ref: 'Offer' },
    messages: [messageSchema],
  },
  { timestamps: true }
);

const Message = (mongoose.models.Chat as any) || model<IChat>('Chat', chatSchema);

export default Message;
