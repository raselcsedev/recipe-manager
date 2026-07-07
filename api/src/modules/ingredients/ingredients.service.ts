import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';

export async function listIngredients(search?: string, page = 1, limit = 10) {
  const where = search
    ? { name: { contains: search, mode: 'insensitive' as const } }
    : undefined;

  const [total, data] = await Promise.all([
    prisma.ingredient.count({ where }),
    prisma.ingredient.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export async function createIngredient(name: string) {
  const existing = await prisma.ingredient.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
  });
  if (existing) {
    throw ApiError.conflict('Ingredient already exists');
  }

  return prisma.ingredient.create({ data: { name } });
}

export async function getIngredient(id: string) {
  const ingredient = await prisma.ingredient.findUnique({ where: { id } });
  if (!ingredient) throw ApiError.notFound('Ingredient not found');
  return ingredient;
}

export async function updateIngredient(id: string, name: string) {
  const ingredient = await prisma.ingredient.findUnique({ where: { id } });
  if (!ingredient) throw ApiError.notFound('Ingredient not found');

  const existing = await prisma.ingredient.findFirst({
    where: { name: { equals: name, mode: 'insensitive' }, NOT: { id } },
  });
  if (existing) throw ApiError.conflict('Ingredient already exists');

  return prisma.ingredient.update({ where: { id }, data: { name } });
}

export async function deleteIngredient(id: string) {
  const rowCount = await prisma.recipeIngredient.count({ where: { ingredientId: id } });
  await prisma.ingredient.delete({ where: { id } });
  return { message: `Ingredient deleted (removed from ${rowCount} recipe(s))` };
}
