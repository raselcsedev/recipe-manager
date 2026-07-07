import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createRecipeSchema, updateRecipeSchema, recipeQuerySchema } from './recipes.schema';
import {
  createRecipeHandler,
  listRecipesHandler,
  getRecipeHandler,
  updateRecipeHandler,
  deleteRecipeHandler,
} from './recipes.controller';
import { createUploadMiddleware } from '../../middleware/upload.middleware';

const router = Router();
const upload = createUploadMiddleware('recipes');

router.use(requireAuth);
router.post('/', upload.single('image'), validate(createRecipeSchema), createRecipeHandler);
router.get('/', validate(recipeQuerySchema, 'query'), listRecipesHandler);
router.get('/:id', getRecipeHandler);
router.patch('/:id', upload.single('image'), validate(updateRecipeSchema), updateRecipeHandler);
router.delete('/:id', deleteRecipeHandler);

export default router;
