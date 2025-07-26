import { Request } from 'express';

export interface IUser {
  _id?: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'member';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITask {
  _id?: string;
  title: string;
  description: string;
  assignedTo: string; // User ID
  assignedBy: string; // Admin User ID
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

export interface ITaskHistory {
  _id?: string;
  taskId: string;
  userId: string;
  action: 'created' | 'assigned' | 'completed' | 'updated' | 'overdue';
  details: string;
  timestamp: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    username: string;
  };
}

