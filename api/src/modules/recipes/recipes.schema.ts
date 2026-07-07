import { z } from 'zod';

export const ingredientSchema = z.object({
  ingredientId: z.string().uuid('Ingredient ID must be a valid UUID'),
  quantity: z.string().min(1, 'Quantity is required'),
});

export const createRecipeSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  instructions: z.string().min(1, 'Instructions are required'),
  categoryId: z.string().uuid('Category ID must be a valid UUID'),
  ingredients: z.string().min(1, 'Ingredients are required'),
});

export const updateRecipeSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').optional(),
  description: z.string().optional(),
  instructions: z.string().min(1, 'Instructions are required').optional(),
  categoryId: z.string().uuid('Category ID must be a valid UUID').optional(),
  ingredients: z.string().optional(),
});

export const recipeQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(['newest', 'oldest']).optional().default('newest'),
  page: z.string().optional().transform(val => Number(val ?? '1')),
  limit: z.string().optional().transform(val => Number(val ?? '10')),
});

export const ingredientsJsonSchema = z.array(ingredientSchema).min(1, 'At least one ingredient is required');
