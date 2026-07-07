import { prisma } from '../../lib/prisma';

export async function getDashboardCounts(userId: string) {
  const [totalRecipes, totalCategories, totalIngredients, favoriteRecipesCount] = await Promise.all([
    prisma.recipe.count(),
    prisma.category.count(),
    prisma.ingredient.count(),
    prisma.favorite.count({ where: { userId } }),
  ]);

  return {
    totalRecipes,
    totalCategories,
    totalIngredients,
    favoriteRecipesCount,
  };
}
