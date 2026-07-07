import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';

describe('Recipe Manager API', () => {
  const agent = request.agent(app);
  const testUser = {
    name: 'Test User',
    email: 'test-user@example.com',
    password: 'Password1',
  };

  let accessToken: string;
  let recipeId: string;
  let categoryId: string;
  let ingredientAId: string;
  let ingredientBId: string;

  beforeAll(async () => {
    await prisma.favorite.deleteMany();
    await prisma.recipeIngredient.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.category.deleteMany();
    await prisma.ingredient.deleteMany();
    await prisma.user.deleteMany();

    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category',
      },
    });

    const ingredientA = await prisma.ingredient.create({
      data: {
        name: 'Ingredient A',
      },
    });

    const ingredientB = await prisma.ingredient.create({
      data: {
        name: 'Ingredient B',
      },
    });

    categoryId = category.id;
    ingredientAId = ingredientA.id;
    ingredientBId = ingredientB.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('registers a new user and stores refresh token cookie', async () => {
    const response = await agent.post('/api/auth/register').send(testUser).expect(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(testUser.email);
    expect(response.body.data.accessToken).toBeTruthy();
    expect(response.headers['set-cookie']).toBeDefined();

    accessToken = response.body.data.accessToken;
  });

  it('logs in with the registered user', async () => {
    const response = await agent.post('/api/auth/login').send({ email: testUser.email, password: testUser.password }).expect(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeTruthy();
    accessToken = response.body.data.accessToken;
  });

  it('refreshes the access token with refresh cookie', async () => {
    const response = await agent.post('/api/auth/refresh').expect(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeTruthy();
    accessToken = response.body.data.accessToken;
  });

  it('creates a recipe', async () => {
    const payload = {
      title: 'Test Recipe',
      description: 'A recipe created during tests',
      instructions: 'Mix and cook.',
      categoryId,
      ingredients: JSON.stringify([
        { ingredientId: ingredientAId, quantity: '1 cup' },
        { ingredientId: ingredientBId, quantity: '2 tsp' },
      ]),
    };

    const response = await agent
      .post('/api/recipes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBeTruthy();
    expect(response.body.data.title).toBe(payload.title);
    expect(response.body.data.ingredients).toHaveLength(2);

    recipeId = response.body.data.id;
  });

  it('lists recipes and returns the created recipe', async () => {
    const response = await agent
      .get('/api/recipes')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: '1', limit: '10' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].id).toBe(recipeId);
  });

  it('retrieves the recipe by id and indicates it is not favorited', async () => {
    const response = await agent
      .get(`/api/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(recipeId);
    expect(response.body.data.isFavorited).toBe(false);
  });

  it('adds the recipe to favorites', async () => {
    const response = await agent
      .post(`/api/favorites/${recipeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBeTruthy();
  });

  it('returns the recipe as favorited after adding to favorites', async () => {
    const response = await agent
      .get(`/api/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.isFavorited).toBe(true);
  });

  it('lists favorites and includes the favorited recipe', async () => {
    const response = await agent
      .get('/api/favorites')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: '1', limit: '10' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].id).toBe(recipeId);
  });

  it('returns dashboard counts including the favorite recipe', async () => {
    const response = await agent.get('/api/dashboard').set('Authorization', `Bearer ${accessToken}`).expect(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalRecipes).toBe(1);
    expect(response.body.data.totalCategories).toBe(1);
    expect(response.body.data.totalIngredients).toBe(2);
    expect(response.body.data.favoriteRecipesCount).toBe(1);
  });

  it('removes the recipe from favorites', async () => {
    await agent
      .delete(`/api/favorites/${recipeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const response = await agent
      .get(`/api/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.isFavorited).toBe(false);
  });

  it('updates the recipe', async () => {
    const response = await agent
      .patch(`/api/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated Recipe',
        description: 'Updated description',
        instructions: 'Stir and serve.',
        ingredients: JSON.stringify([{ ingredientId: ingredientAId, quantity: '3 cups' }]),
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Updated Recipe');
    expect(response.body.data.ingredients).toHaveLength(1);
  });

  it('deletes the recipe', async () => {
    await agent
      .delete(`/api/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const response = await agent
      .get('/api/recipes')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: '1', limit: '10' })
      .expect(200);

    expect(response.body.data.length).toBe(0);
  });
});
