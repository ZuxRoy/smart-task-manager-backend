import { Task, ITaskDocument } from '../models/Task';
import { TaskHistory } from '../models/TaskHistory';
import { User } from '../models/User';

export class TaskService {
  static async checkTaskConflicts(userId: string, newDueDate: Date, excludeTaskId?: string) {
    const conflicts = await Task.find({
      assignedTo: userId,
      status: { $in: ['pending', 'in_progress'] },
      dueDate: {
        $gte: new Date(newDueDate.getTime() - 24 * 60 * 60 * 1000),
        $lte: new Date(newDueDate.getTime() + 24 * 60 * 60 * 1000)
      },
      ...(excludeTaskId && { _id: { $ne: excludeTaskId } })
    }).populate('assignedTo', 'username');

    return conflicts;
  }

  static async checkUserWorkload(userId: string) {
    const activeTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $in: ['pending', 'in_progress'] }
    });

    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: 'overdue'
    });

    return {
      activeTasks,
      overdueTasks,
      isHighWorkload: activeTasks > 5 || overdueTasks > 2
    };
  }

  static async updateOverdueTasks() {
    const overdueTasks = await Task.find({
      status: { $in: ['pending', 'in_progress'] },
      dueDate: { $lt: new Date() }
    });

    for (const task of overdueTasks) {
      task.status = 'overdue';
      await task.save();

      await TaskHistory.create({
        taskId: task._id,
        userId: task.assignedTo,
        action: 'overdue',
        details: `Task "${task.title}" became overdue`
      });
    }

    return overdueTasks.length;
  }

  static async logTaskHistory(taskId: string, userId: string, action: string, details: string) {
    await TaskHistory.create({
      taskId,
      userId,
      action,
      details
    });
  }
}

