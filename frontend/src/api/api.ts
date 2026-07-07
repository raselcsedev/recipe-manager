import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
});

export const setAccessToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export interface RecipeInput {
  title: string;
  description?: string;
  instructions: string;
  categoryId: string;
  ingredients: Array<{ ingredientId: string; quantity: string }>;
}

export type Recipe = {
  id: string;
  title: string;
  description?: string;
  instructions: string;
  image?: string | null;
  category: { id: string; name: string };
  ingredients: Array<{ id: string; name: string; quantity: string }>;
  createdAt: string;
  updatedAt: string;
  isFavorited: boolean;
};

export type DashboardCounts = {
  totalRecipes: number;
  totalCategories: number;
  totalIngredients: number;
  favoriteRecipesCount: number;
};

export function registerUser(data: { name: string; email: string; password: string }) {
  return api.post('/auth/register', data);
}

export function loginUser(data: { email: string; password: string }) {
  return api.post('/auth/login', data);
}

export function refreshToken() {
  return api.post('/auth/refresh');
}

export function logoutUser() {
  return api.post('/auth/logout');
}

export function fetchCategories(params?: Record<string, string | number>) {
  return api.get('/categories', { params });
}

export function fetchIngredients(params?: Record<string, string | number>) {
  return api.get('/ingredients', { params });
}

export function fetchRecipes(params?: Record<string, string | number>) {
  return api.get('/recipes', { params });
}

export function fetchRecipe(id: string) {
  return api.get(`/recipes/${id}`);
}

export function addRecipe(data: RecipeInput) {
  const formData = new FormData();
  formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  formData.append('instructions', data.instructions);
  formData.append('categoryId', data.categoryId);
  formData.append('ingredients', JSON.stringify(data.ingredients));
  return api.post('/recipes', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export function updateRecipe(id: string, data: Partial<RecipeInput>) {
  const formData = new FormData();
  if (data.title) formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.instructions) formData.append('instructions', data.instructions);
  if (data.categoryId) formData.append('categoryId', data.categoryId);
  if (data.ingredients) formData.append('ingredients', JSON.stringify(data.ingredients));
  return api.patch(`/recipes/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export function deleteRecipe(id: string) {
  return api.delete(`/recipes/${id}`);
}

export function addFavorite(recipeId: string) {
  return api.post(`/favorites/${recipeId}`);
}

export function removeFavorite(recipeId: string) {
  return api.delete(`/favorites/${recipeId}`);
}

export function fetchFavorites(params?: Record<string, string | number>) {
  return api.get('/favorites', { params });
}

export function fetchDashboard() {
  return api.get('/dashboard');
}

export function fetchProfile() {
  return api.get('/users/me');
}

export function updateProfile(data: { name?: string; email?: string }) {
  return api.patch('/users/me', data);
}

export function changePassword(data: { currentPassword: string; newPassword: string }) {
  return api.patch('/users/change-password', data);
}
