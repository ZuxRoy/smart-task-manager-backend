import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITaskHistory {
  taskId: Types.ObjectId;
  userId: Types.ObjectId;
  action: 'created' | 'assigned' | 'completed' | 'updated' | 'overdue';
  details: string;
  timestamp: Date;
}

export interface ITaskHistoryDocument extends Omit<ITaskHistory, '_id'>, Document {}

const TaskHistorySchema = new Schema<ITaskHistoryDocument>({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'assigned', 'completed', 'updated', 'overdue'],
    required: true
  },
  details: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

TaskHistorySchema.index({ userId: 1, timestamp: -1 });
TaskHistorySchema.index({ taskId: 1, timestamp: -1 });

export const TaskHistory = mongoose.model<ITaskHistoryDocument>('TaskHistory', TaskHistorySchema);
