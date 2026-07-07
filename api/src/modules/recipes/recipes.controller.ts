import fs from 'fs/promises';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/ApiResponse';
import {
  createRecipe,
  getRecipeById,
  listRecipes,
  getRecipeForOwnerCheck,
  updateRecipe,
  deleteRecipe,
} from './recipes.service';
import { env } from '../../config/env';
import { ingredientsJsonSchema } from './recipes.schema';
import { ApiError } from '../../utils/ApiError';

const parseIngredients = (raw: string) => {
  try {
    return ingredientsJsonSchema.parse(JSON.parse(raw));
  } catch (_error) {
    throw ApiError.badRequest('Ingredients must be a JSON array of { ingredientId, quantity }');
  }
};

export const createRecipeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, instructions, categoryId, ingredients } = req.body;
    const parsedIngredients = parseIngredients(ingredients);
    const imagePath = req.file ? path.join('recipes', req.file.filename).replace(/\\/g, '/') : undefined;
    const recipe = await createRecipe({
      title,
      description,
      instructions,
      categoryId,
      userId: req.user!.userId,
      image: imagePath,
      ingredients: parsedIngredients,
    });
    return sendSuccess(res, recipe, undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const listRecipesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, sort, page, limit } = req.query as any;
    const result = await listRecipes({
      search,
      category,
      sort,
      page,
      limit,
      currentUserId: req.user!.userId,
    });
    return sendSuccess(res, result.data, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getRecipeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipe = await getRecipeById(req.params.id, req.user!.userId);
    return sendSuccess(res, recipe);
  } catch (error) {
    next(error);
  }
};

export const updateRecipeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipe = await getRecipeForOwnerCheck(req.params.id);
    if (!recipe) throw ApiError.notFound('Recipe not found');
    if (recipe.userId !== req.user!.userId) throw ApiError.forbidden('Not authorized to update this recipe');

    const payload: any = {};
    if (req.body.title !== undefined) payload.title = req.body.title;
    if (req.body.description !== undefined) payload.description = req.body.description;
    if (req.body.instructions !== undefined) payload.instructions = req.body.instructions;
    if (req.body.categoryId !== undefined) payload.categoryId = req.body.categoryId;
    if (req.file) payload.image = path.join('recipes', req.file.filename).replace(/\\/g, '/');
    if (req.body.ingredients !== undefined) payload.ingredients = parseIngredients(req.body.ingredients);

    const updated = await updateRecipe(req.params.id, payload, req.user!.userId);
    if (req.file && recipe.image) {
      const oldFile = path.join(process.cwd(), env.UPLOAD_DIR, recipe.image);
      fs.unlink(oldFile).catch(() => undefined);
    }
    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

export const deleteRecipeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipe = await getRecipeForOwnerCheck(req.params.id);
    if (!recipe) throw ApiError.notFound('Recipe not found');
    if (recipe.userId !== req.user!.userId) throw ApiError.forbidden('Not authorized to delete this recipe');

    await deleteRecipe(req.params.id);
    if (recipe.image) {
      const oldFile = path.join(process.cwd(), env.UPLOAD_DIR, recipe.image);
      fs.unlink(oldFile).catch(() => undefined);
    }
    return sendSuccess(res, { message: 'Recipe deleted successfully' });
  } catch (error) {
    next(error);
  }
};
