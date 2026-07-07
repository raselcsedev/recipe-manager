import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';

export async function createRecipe(data: {
  title: string;
  description?: string;
  instructions: string;
  categoryId: string;
  userId: string;
  image?: string;
  ingredients: Array<{ ingredientId: string; quantity: string }>;
}) {
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  const ingredientIds = data.ingredients.map(item => item.ingredientId);
  const existingIngredients = await prisma.ingredient.findMany({
    where: { id: { in: ingredientIds } },
    select: { id: true },
  });

  const missingIds = ingredientIds.filter(id => !existingIngredients.some(i => i.id === id));
  if (missingIds.length > 0) {
    throw ApiError.badRequest(`Ingredient(s) not found: ${missingIds.join(', ')}`);
  }

  const recipe = await prisma.recipe.create({
    data: {
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      image: data.image,
      userId: data.userId,
      categoryId: data.categoryId,
      ingredients: {
        createMany: {
          data: data.ingredients.map(item => ({
            ingredientId: item.ingredientId,
            quantity: item.quantity,
          })),
        },
      },
    },
  });

  return getRecipeById(recipe.id, data.userId);
}

export async function getRecipeById(id: string, currentUserId: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      ingredients: { include: { ingredient: { select: { id: true, name: true } } } },
      user: { select: { id: true, name: true } },
    },
  });

  if (!recipe) throw ApiError.notFound('Recipe not found');

  const favorite = await prisma.favorite.findUnique({
    where: { userId_recipeId: { userId: currentUserId, recipeId: id } },
    select: { id: true },
  });

  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    instructions: recipe.instructions,
    image: recipe.image,
    category: recipe.category,
    ingredients: recipe.ingredients.map(link => ({
      id: link.ingredient.id,
      name: link.ingredient.name,
      quantity: link.quantity,
    })),
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
    ownerName: recipe.user.name,
    userId: recipe.userId,
    isFavorited: Boolean(favorite),
  };
}

export async function listRecipes(params: {
  search?: string;
  category?: string;
  sort: 'newest' | 'oldest';
  page: number;
  limit: number;
  currentUserId: string;
}) {
  const where: any = {};
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' as const } },
      { description: { contains: params.search, mode: 'insensitive' as const } },
    ];
  }

  if (params.category) {
    where.categoryId = params.category;
  }

  const [total, recipes] = await Promise.all([
    prisma.recipe.count({ where }),
    prisma.recipe.findMany({
      where,
      orderBy: { createdAt: params.sort === 'newest' ? 'desc' : 'asc' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      include: {
        category: { select: { id: true, name: true } },
        ingredients: { include: { ingredient: { select: { id: true, name: true } } } },
      },
    }),
  ]);

  const recipeIds = recipes.map(recipe => recipe.id);
  const favorites = recipeIds.length
    ? await prisma.favorite.findMany({
        where: { userId: params.currentUserId, recipeId: { in: recipeIds } },
        select: { recipeId: true },
      })
    : [];

  const favoriteIds = new Set(favorites.map(fav => fav.recipeId));

  const data = recipes.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    instructions: recipe.instructions,
    image: recipe.image,
    category: recipe.category,
    ingredients: recipe.ingredients.map(link => ({
      id: link.ingredient.id,
      name: link.ingredient.name,
      quantity: link.quantity,
    })),
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
    isFavorited: favoriteIds.has(recipe.id),
  }));

  const totalPages = Math.max(1, Math.ceil(total / params.limit));

  return {
    data,
    meta: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPrevPage: params.page > 1,
    },
  };
}

export async function getRecipeForOwnerCheck(id: string) {
  return prisma.recipe.findUnique({ where: { id }, select: { id: true, userId: true, image: true } });
}

export async function updateRecipe(
  id: string,
  data: {
    title?: string;
    description?: string;
    instructions?: string;
    categoryId?: string;
    image?: string | null;
    ingredients?: Array<{ ingredientId: string; quantity: string }>;
  },
  currentUserId: string
) {
  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw ApiError.notFound('Category not found');
  }

  if (data.ingredients) {
    const ingredientIds = data.ingredients.map(item => item.ingredientId);
    const existingIngredients = await prisma.ingredient.findMany({
      where: { id: { in: ingredientIds } },
      select: { id: true },
    });
    const missingIds = ingredientIds.filter(id => !existingIngredients.some(i => i.id === id));
    if (missingIds.length > 0) {
      throw ApiError.badRequest(`Ingredient(s) not found: ${missingIds.join(', ')}`);
    }
  }

  await prisma.$transaction(async tx => {
    if (data.ingredients) {
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
    }

    await tx.recipe.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        image: data.image,
        categoryId: data.categoryId,
      },
    });

    if (data.ingredients) {
      await tx.recipeIngredient.createMany({
        data: data.ingredients.map(item => ({
          recipeId: id,
          ingredientId: item.ingredientId,
          quantity: item.quantity,
        })),
      });
    }
  });

  return getRecipeById(id, currentUserId);
}

export async function deleteRecipe(id: string) {
  return prisma.recipe.delete({ where: { id } });
}
