import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchRecipes, Recipe } from '../api/api';

const RecipeListPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecipes({ page: 1, limit: 20 })
      .then(response => {
        setRecipes(response.data.data);
      })
      .catch(err => {
        setError(err?.response?.data?.message || 'Unable to load recipes');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading recipes...</div>;
  if (error) return <div className="card error">{error}</div>;

  return (
    <div className="card">
      <h2>Recipes</h2>
      {recipes.length === 0 ? (
        <p>No recipes found.</p>
      ) : (
        <ul className="recipe-list">
          {recipes.map(recipe => (
            <li key={recipe.id}>
              <Link to={`/recipes/${recipe.id}`}>
                <strong>{recipe.title}</strong>
              </Link>
              <p>{recipe.description}</p>
              <small>{recipe.category.name}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecipeListPage;
