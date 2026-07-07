import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/ApiResponse';
import {
  listCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} from './categories.service';

export const listCategoriesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page, limit } = req.query as any;
    const result = await listCategories(search, page, limit);
    return sendSuccess(res, result.data, result.meta);
  } catch (error) {
    next(error);
  }
};

export const createCategoryHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await createCategory(req.body.name);
    return sendSuccess(res, category, undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const getCategoryHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await getCategory(req.params.id);
    return sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
};

export const updateCategoryHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await updateCategory(req.params.id, req.body.name);
    return sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await deleteCategory(req.params.id);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};
