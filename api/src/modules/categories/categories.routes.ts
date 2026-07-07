import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { categoryQuerySchema, categoryBodySchema } from './categories.schema';
import {
  listCategoriesHandler,
  createCategoryHandler,
  getCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from './categories.controller';

const router = Router();
router.use(requireAuth);
router.get('/', validate(categoryQuerySchema, 'query'), listCategoriesHandler);
router.post('/', validate(categoryBodySchema), createCategoryHandler);
router.get('/:id', getCategoryHandler);
router.patch('/:id', validate(categoryBodySchema), updateCategoryHandler);
router.delete('/:id', deleteCategoryHandler);

export default router;
