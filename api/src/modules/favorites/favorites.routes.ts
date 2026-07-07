import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { paginationSchema } from './favorites.schema';
import { addFavoriteHandler, removeFavoriteHandler, listFavoritesHandler } from './favorites.controller';

const router = Router();
router.use(requireAuth);
router.post('/:recipeId', addFavoriteHandler);
router.delete('/:recipeId', removeFavoriteHandler);
router.get('/', validate(paginationSchema, 'query'), listFavoritesHandler);

export default router;
