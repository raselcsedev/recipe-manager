import { z } from 'zod';

export const ingredientQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().transform(val => Number(val ?? '1')),
  limit: z.string().optional().transform(val => Number(val ?? '10')),
});

export const ingredientBodySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});
