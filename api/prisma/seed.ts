import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Breakfast', slug: 'breakfast' },
  { name: 'Lunch', slug: 'lunch' },
  { name: 'Dinner', slug: 'dinner' },
  { name: 'Dessert', slug: 'dessert' },
  { name: 'Snacks', slug: 'snacks' },
  { name: 'Drinks', slug: 'drinks' },
];

const ingredients = [
  { name: 'Flour' },
  { name: 'Sugar' },
  { name: 'Eggs' },
  { name: 'Butter' },
  { name: 'Milk' },
  { name: 'Salt' },
  { name: 'Olive Oil' },
  { name: 'Garlic' },
  { name: 'Onion' },
  { name: 'Chicken Breast' },
  { name: 'Rice' },
  { name: 'Tomato' },
  { name: 'Cheese' },
  { name: 'Black Pepper' },
  { name: 'Basil' },
];

async function main() {
  console.log('Seeding categories...');
  await prisma.category.createMany({ data: categories, skipDuplicates: true });

  console.log('Seeding ingredients...');
  await prisma.ingredient.createMany({ data: ingredients, skipDuplicates: true });

  console.log('Seed complete.');
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
