import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/ApiResponse';
import {
  listIngredients,
  createIngredient,
  getIngredient,
  updateIngredient,
  deleteIngredient,
} from './ingredients.service';

export const listIngredientsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page, limit } = req.query as any;
    const result = await listIngredients(search, page, limit);
    return sendSuccess(res, result.data, result.meta);
  } catch (error) {
    next(error);
  }
};

export const createIngredientHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ingredient = await createIngredient(req.body.name);
    return sendSuccess(res, ingredient, undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const getIngredientHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ingredient = await getIngredient(req.params.id);
    return sendSuccess(res, ingredient);
  } catch (error) {
    next(error);
  }
};

export const updateIngredientHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ingredient = await updateIngredient(req.params.id, req.body.name);
    return sendSuccess(res, ingredient);
  } catch (error) {
    next(error);
  }
};

export const deleteIngredientHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await deleteIngredient(req.params.id);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};
