import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types/User';

export interface IUserDocument extends IUser, Document {}
export interface IUserModel extends Model<IUserDocument> {}

// Redesign aligned with DB schema. "username" is primary, with alias "name" for backward compatibility
const UserSchema: Schema<IUserDocument> = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [2, 'Username must be at least 2 characters'],
      maxlength: [50, 'Username cannot exceed 50 characters'],
  unique: true,
      alias: 'name',
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
  // Optional profile fields per schema
    bio: { type: String, maxlength: 500 },
    skills: [{ type: String, trim: true }],
  links: [{ type: String, trim: true }],
  // Experience stored as string entries (e.g., "Company - Role - Years")
  experience: [{ type: String, trim: true }],
  // Certifications simply reference Asset IDs
  certifications: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
    credit: { type: Number, default: 0, min: 0 },
    tasksPosted: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    tasksCompleted: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    resume: { type: Schema.Types.ObjectId, ref: 'Asset' },
    profileImage: { type: Schema.Types.ObjectId, ref: 'Asset' },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    toObject: { virtuals: true },
  }
);

// Helpful indexes for frequent lookups
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });

UserSchema.pre<IUserDocument>('save', async function (
  this: any,
  next: (err?: any) => void
) {
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
