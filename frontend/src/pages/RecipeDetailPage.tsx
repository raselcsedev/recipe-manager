import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchRecipe, Recipe, addFavorite, removeFavorite } from '../api/api';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchRecipe(id)
      .then(response => setRecipe(response.data.data))
      .catch(err => setError(err?.response?.data?.message || 'Unable to load recipe'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="card">Loading recipe...</div>;
  if (error) return <div className="card error">{error}</div>;
  if (!recipe) return <div className="card">Recipe not found</div>;

  const toggleFavorite = async () => {
    try {
      if (recipe.isFavorited) {
        await removeFavorite(recipe.id);
      } else {
        await addFavorite(recipe.id);
      }
      setRecipe({ ...recipe, isFavorited: !recipe.isFavorited });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to update favorite');
    }
  };

  return (
    <div className="card">
      <h2>{recipe.title}</h2>
      <button onClick={toggleFavorite} className={recipe.isFavorited ? 'secondary' : undefined}>
        {recipe.isFavorited ? 'Remove Favorite' : 'Add Favorite'}
      </button>
      <p>{recipe.description}</p>
      <p>
        <strong>Category:</strong> {recipe.category.name}
      </p>
      <section>
        <h3>Ingredients</h3>
        <ul>
          {recipe.ingredients.map(item => (
            <li key={item.id}>
              {item.name} - {item.quantity}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Instructions</h3>
        <p>{recipe.instructions}</p>
      </section>
    </div>
  );
};

export default RecipeDetailPage;
