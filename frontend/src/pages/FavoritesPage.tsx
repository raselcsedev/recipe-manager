import { useEffect, useState } from 'react';
import { fetchFavorites, Recipe } from '../api/api';

const FavoritesPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites({ page: 1, limit: 20 })
      .then(response => setRecipes(response.data.data))
      .catch(err => setError(err?.response?.data?.message || 'Unable to load favorites'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading favorites...</div>;
  if (error) return <div className="card error">{error}</div>;

  return (
    <div className="card">
      <h2>Favorites</h2>
      {recipes.length === 0 ? (
        <p>No favorites yet.</p>
      ) : (
        <ul className="recipe-list">
          {recipes.map(recipe => (
            <li key={recipe.id}>{recipe.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavoritesPage;
