import mongoose, { Schema, Document } from 'mongoose';

export interface IToken extends Document {
  token: string;
  email: string;
  createdAt: Date;
}

const TokenSchema = new Schema<IToken>(
  {
    token: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 },
  },
  { timestamps: true }
);

export default mongoose.model<IToken>('Token', TokenSchema);