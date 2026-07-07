import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { getDashboardHandler } from './dashboard.controller';

const router = Router();
router.use(requireAuth);
router.get('/', getDashboardHandler);

export default router;
