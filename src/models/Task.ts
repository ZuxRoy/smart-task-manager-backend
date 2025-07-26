import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITask {
  title: string;
  description: string;
  assignedTo: Types.ObjectId;
  assignedBy: Types.ObjectId;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

export interface ITaskDocument extends Omit<ITask, '_id'>, Document {}

const TaskSchema = new Schema<ITaskDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ status: 1 });

export const Task = mongoose.model<ITaskDocument>('Task', TaskSchema);
