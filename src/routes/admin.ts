import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { auth, adminAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all admin routes
router.use(auth);
router.use(adminAuth);

// User management
router.post('/users', AdminController.createUser);
router.get('/users', AdminController.getUsers);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

// Task management
router.post('/tasks', AdminController.createTask);
router.get('/tasks', AdminController.getTasks);
router.put('/tasks/:id', AdminController.updateTask);
router.delete('/tasks/:id', AdminController.deleteTask);

// Analytics
router.get('/tasks/due', AdminController.getDueTasks);
router.get('/users/:userId/history', AdminController.getUserHistory);

export { router as adminRoutes };

