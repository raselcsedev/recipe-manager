import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/ApiResponse';
import { addFavorite, removeFavorite, listFavorites } from './favorites.service';

export const addFavoriteHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const favorite = await addFavorite(req.user!.userId, req.params.recipeId);
    return sendSuccess(res, favorite, undefined, favorite.id ? 200 : 201);
  } catch (error) {
    next(error);
  }
};

export const removeFavoriteHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await removeFavorite(req.user!.userId, req.params.recipeId);
    return sendSuccess(res, { message: 'Favorite removed' });
  } catch (error) {
    next(error);
  }
};

export const listFavoritesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query as any;
    const result = await listFavorites(req.user!.userId, page, limit);
    return sendSuccess(res, result.data, result.meta);
  } catch (error) {
    next(error);
  }
};
