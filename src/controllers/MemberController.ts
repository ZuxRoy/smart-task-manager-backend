import { Response } from 'express';
import { Task } from '../models/Task';
import { TaskHistory } from '../models/TaskHistory';
import { AuthRequest } from '../types';
import { TaskService } from '../services/TaskService';

export class MemberController {
  static async getMyTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, priority, sortBy = 'dueDate' } = req.query;
      
      const filter: any = { assignedTo: req.user!.id };
      if (status) filter.status = status;
      if (priority) filter.priority = priority;

      const sortOptions: any = {};
      if (sortBy === 'priority') {
        sortOptions.priority = 1;
        sortOptions.dueDate = 1;
      } else {
        sortOptions.dueDate = 1;
      }

      const tasks = await Task.find(filter)
        .populate('assignedBy', 'username')
        .sort(sortOptions);

      res.json({ tasks });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  static async completeTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const task = await Task.findOne({ _id: id, assignedTo: req.user!.id });
      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }

      if (task.status === 'completed') {
        res.status(400).json({ message: 'Task already completed' });
        return;
      }

      task.status = 'completed';
      task.completedAt = new Date();
      await task.save();

      await TaskService.logTaskHistory(
        id,
        req.user!.id,
        'completed',
        `Task "${task.title}" marked as completed`
      );

      res.json({ message: 'Task completed successfully', task });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getMyHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      
      // Get user's tasks
      const filter: any = { assignedTo: req.user!.id };
      if (status) filter.status = status;

      const tasks = await Task.find(filter)
        .populate('assignedBy', 'username')
        .sort({ createdAt: -1 });

      // Categorize tasks
      const categorized = {
        completed: tasks.filter(t => t.status === 'completed'),
        overdue: tasks.filter(t => t.status === 'overdue'),
        incomplete: tasks.filter(t => ['pending', 'in_progress'].includes(t.status)),
        due: tasks.filter(t => {
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return t.dueDate <= tomorrow && ['pending', 'in_progress'].includes(t.status);
        })
      };

      res.json({ tasks: categorized });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }
}

