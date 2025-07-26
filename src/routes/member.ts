import { Router } from 'express';
import { MemberController } from '../controllers/MemberController';
import { auth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all member routes
router.use(auth);

router.get('/tasks', MemberController.getMyTasks);
router.put('/tasks/:id/complete', MemberController.completeTask);
router.get('/history', MemberController.getMyHistory);

export { router as memberRoutes };

