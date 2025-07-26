import { Response } from 'express';
import { User } from '../models/User';
import { Task } from '../models/Task';
import { TaskHistory } from '../models/TaskHistory';
import { AuthRequest } from '../types';
import { userValidation, taskValidation } from '../utils/validation';
import { TaskService } from '../services/TaskService';

export class AdminController {
  // User Management
  static async createUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { error, value } = userValidation.validate(req.body);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }

      const existingUser = await User.findOne({
        $or: [{ email: value.email }, { username: value.username }]
      });

      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      const user = new User(value);
      await user.save();

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await User.find({}, '-password');
      res.json({ users });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.password) {
        delete updates.password; // Password updates should be handled separately
      }

      const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({ message: 'User updated successfully', user });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if user has active tasks
      const activeTasks = await Task.countDocuments({
        assignedTo: id,
        status: { $in: ['pending', 'in_progress'] }
      });

      if (activeTasks > 0) {
        res.status(400).json({ 
          message: 'Cannot delete user with active tasks. Please reassign or complete tasks first.' 
        });
        return;
      }

      const user = await User.findByIdAndDelete(id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Task Management
  static async createTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { error, value } = taskValidation.validate(req.body);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }

      // Check if assigned user exists
      const assignedUser = await User.findById(value.assignedTo);
      if (!assignedUser) {
        res.status(404).json({ message: 'Assigned user not found' });
        return;
      }

      // Check for conflicts
      const conflicts = await TaskService.checkTaskConflicts(value.assignedTo, value.dueDate);
      const workload = await TaskService.checkUserWorkload(value.assignedTo);

      const warnings = [];
      if (conflicts.length > 0) {
        warnings.push({
          type: 'conflict',
          message: `User has ${conflicts.length} task(s) due around the same time`,
          conflictingTasks: conflicts.map(t => ({ id: t._id, title: t.title, dueDate: t.dueDate }))
        });
      }

      if (workload.isHighWorkload) {
        warnings.push({
          type: 'workload',
          message: `User has high workload: ${workload.activeTasks} active tasks, ${workload.overdueTasks} overdue tasks`
        });
      }

      const task = new Task({
        ...value,
        assignedBy: req.user!.id
      });

      await task.save();
      await TaskService.logTaskHistory(
        (task._id as any).toString(),
        req.user!.id,
        'created',
        `Task "${task.title}" created and assigned to ${assignedUser.username}`
      );

      res.status(201).json({
        message: 'Task created successfully',
        task,
        warnings
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, status, priority } = req.query;
      
      const filter: any = {};
      if (userId) filter.assignedTo = userId;
      if (status) filter.status = status;
      if (priority) filter.priority = priority;

      const tasks = await Task.find(filter)
        .populate('assignedTo', 'username email')
        .populate('assignedBy', 'username')
        .sort({ dueDate: 1 });

      res.json({ tasks });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const task = await Task.findById(id);
      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }

      let warnings = [];

      // Check for conflicts if assignedTo or dueDate is being updated
      if (updates.assignedTo || updates.dueDate) {
        const userId = updates.assignedTo || task.assignedTo;
        const dueDate = updates.dueDate || task.dueDate;
        
        const conflicts = await TaskService.checkTaskConflicts(userId, new Date(dueDate), id);
        const workload = await TaskService.checkUserWorkload(userId);

        if (conflicts.length > 0) {
          warnings.push({
            type: 'conflict',
            message: `User has ${conflicts.length} task(s) due around the same time`,
            conflictingTasks: conflicts.map(t => ({ id: t._id, title: t.title, dueDate: t.dueDate }))
          });
        }

        if (workload.isHighWorkload) {
          warnings.push({
            type: 'workload',
            message: `User has high workload: ${workload.activeTasks} active tasks, ${workload.overdueTasks} overdue tasks`
          });
        }
      }

      const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true })
        .populate('assignedTo', 'username email')
        .populate('assignedBy', 'username');

      await TaskService.logTaskHistory(
        id,
        req.user!.id,
        'updated',
        `Task "${task.title}" updated`
      );

      res.json({ 
        message: 'Task updated successfully', 
        task: updatedTask,
        warnings
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  static async deleteTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const task = await Task.findByIdAndDelete(id);
      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }

      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Analytics and Reports
  static async getDueTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const filter: any = {
        dueDate: { $lte: tomorrow },
        status: { $in: ['pending', 'in_progress'] }
      };

      if (userId) filter.assignedTo = userId;

      const dueTasks = await Task.find(filter)
        .populate('assignedTo', 'username email')
        .sort({ dueDate: 1 });

      res.json({ tasks: dueTasks });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getUserHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { status } = req.query;

      // Get user's tasks
      const filter: any = { assignedTo: userId };
      if (status) filter.status = status;

      const tasks = await Task.find(filter)
        .populate('assignedBy', 'username')
        .sort({ createdAt: -1 });

      // Get task history
      const history = await TaskHistory.find({ userId })
        .populate('taskId', 'title')
        .sort({ timestamp: -1 })
        .limit(50);

      res.json({ tasks, history });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }
}

