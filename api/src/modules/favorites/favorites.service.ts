import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';

export async function addFavorite(userId: string, recipeId: string) {
  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
  if (!recipe) throw ApiError.notFound('Recipe not found');

  const existing = await prisma.favorite.findUnique({
    where: { userId_recipeId: { userId, recipeId } },
  });
  if (existing) return existing;

  return prisma.favorite.create({ data: { userId, recipeId } });
}

export async function removeFavorite(userId: string, recipeId: string) {
  const existing = await prisma.favorite.findUnique({
    where: { userId_recipeId: { userId, recipeId } },
  });
  if (!existing) return null;

  return prisma.favorite.delete({ where: { id: existing.id } });
}

export async function listFavorites(userId: string, page = 1, limit = 10) {
  const [total, favorites] = await Promise.all([
    prisma.favorite.count({ where: { userId } }),
    prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        recipe: {
          include: {
            category: { select: { id: true, name: true } },
            ingredients: { include: { ingredient: { select: { id: true, name: true } } } },
          },
        },
      },
    }),
  ]);

  const data = favorites.map(fav => ({
    id: fav.recipe.id,
    title: fav.recipe.title,
    description: fav.recipe.description,
    instructions: fav.recipe.instructions,
    image: fav.recipe.image,
    category: fav.recipe.category,
    ingredients: fav.recipe.ingredients.map(link => ({
      id: link.ingredient.id,
      name: link.ingredient.name,
      quantity: link.quantity,
    })),
    createdAt: fav.recipe.createdAt,
    updatedAt: fav.recipe.updatedAt,
    isFavorited: true,
  }));

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
