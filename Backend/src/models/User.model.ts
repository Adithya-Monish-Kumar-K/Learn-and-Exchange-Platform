import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types/User';

export interface IUserDocument extends IUser, Document {}
export interface IUserModel extends Model<IUserDocument> {}

const UserSchema: Schema<IUserDocument> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    bio: { type: String, maxlength: 500 },
    skills: [
      {
        name: { type: String, required: true },
        level: { type: String },
        years: { type: Number },
      },
    ],
    qualifications: [
      {
        title: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number, required: true },
      },
    ],
    experience: [
      {
        company: { type: String, required: true },
        role: { type: String, required: true },
        duration: { type: String, required: true },
        description: { type: String },
      },
    ],
    certifications: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
    links: [{ type: String }],
    recommendations: [
      {
        fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    tasksPosted: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    tasksCompleted: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    resume: { type: Schema.Types.ObjectId, ref: 'Asset' },
    profileImage: { type: Schema.Types.ObjectId, ref: 'Asset' },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User: IUserModel = mongoose.model<IUserDocument, IUserModel>(
  'User',
  UserSchema
);

export default User;
