import { prisma } from '../../lib/prisma';
import { slugify } from '../../utils/slugify';
import { ApiError } from '../../utils/ApiError';

export async function listCategories(search?: string, page = 1, limit = 10) {
  const where = search
    ? { name: { contains: search, mode: 'insensitive' as const } }
    : undefined;

  const [total, data] = await Promise.all([
    prisma.category.count({ where }),
    prisma.category.findMany({
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

async function generateUniqueSlug(name: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let count = 1;

  while (
    await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    })
  ) {
    count += 1;
    slug = `${baseSlug}-${count}`;
  }

  return slug;
}

export async function createCategory(name: string) {
  const existing = await prisma.category.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
  });

  if (existing) {
    throw ApiError.conflict('Category already exists');
  }

  return prisma.category.create({
    data: {
      name,
      slug: await generateUniqueSlug(name),
    },
  });
}

export async function getCategory(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw ApiError.notFound('Category not found');
  return category;
}

export async function updateCategory(id: string, name: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw ApiError.notFound('Category not found');

  if (category.name.toLowerCase() === name.toLowerCase()) {
    return category;
  }

  const existing = await prisma.category.findFirst({
    where: { name: { equals: name, mode: 'insensitive' }, NOT: { id } },
  });
  if (existing) throw ApiError.conflict('Category already exists');

  return prisma.category.update({
    where: { id },
    data: {
      name,
      slug: await generateUniqueSlug(name),
    },
  });
}

export async function deleteCategory(id: string) {
  const recipeCount = await prisma.recipe.count({ where: { categoryId: id } });
  if (recipeCount > 0) {
    throw ApiError.conflict(`Cannot delete category: ${recipeCount} recipe(s) still use it`);
  }
  await prisma.category.delete({ where: { id } });
  return { message: 'Category deleted successfully' };
}
