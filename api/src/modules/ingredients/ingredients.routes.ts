import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { ingredientQuerySchema, ingredientBodySchema } from './ingredients.schema';
import {
  listIngredientsHandler,
  createIngredientHandler,
  getIngredientHandler,
  updateIngredientHandler,
  deleteIngredientHandler,
} from './ingredients.controller';

const router = Router();
router.use(requireAuth);
router.get('/', validate(ingredientQuerySchema, 'query'), listIngredientsHandler);
router.post('/', validate(ingredientBodySchema), createIngredientHandler);
router.get('/:id', getIngredientHandler);
router.patch('/:id', validate(ingredientBodySchema), updateIngredientHandler);
router.delete('/:id', deleteIngredientHandler);

export default router;
