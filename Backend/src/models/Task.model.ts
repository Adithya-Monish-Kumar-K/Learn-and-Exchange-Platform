import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITask {
  title: string;
  description: string;
  postedBy: mongoose.Types.ObjectId;
  offer: string[];
  requirements: string[];
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
  applicants?: mongoose.Types.ObjectId[];
  assignedTo?: mongoose.Types.ObjectId;
  deadline?: Date;
  attachments?: mongoose.Types.ObjectId[];
}

export interface ITaskDocument extends ITask, Document {}
export interface ITaskModel extends Model<ITaskDocument> {}

const TaskSchema: Schema<ITaskDocument> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    offer: {
      type: [String],
      required: [true, 'Offer is required'],
      maxlength: [500, 'Offer cannot exceed 500 characters'],
    },
    requirements: [
      {
        type: String,
        required: true,
        maxlength: 100,
      },
    ],
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
    applicants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    deadline: { type: Date },
    attachments: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
  },
  { timestamps: true }
);

const Task: ITaskModel = mongoose.models.Task || mongoose.model<ITaskDocument, ITaskModel>('Task', TaskSchema);

export default Task;
