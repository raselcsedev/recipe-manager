import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchRecipe, RecipeDetail, addFavorite, removeFavorite, deleteRecipe } from '../api/api';
import { useAuth } from '../hooks/useAuth';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
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

  const handleDelete = async () => {
    if (!window.confirm('Delete this recipe?')) return;
    try {
      await deleteRecipe(recipe.id);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to delete recipe');
    }
  };

  return (
    <div className="card">
      <div className="detail-header">
        <h2>{recipe.title}</h2>
        <div className="button-row">
          <button onClick={toggleFavorite} className={recipe.isFavorited ? 'secondary' : undefined}>
            {recipe.isFavorited ? 'Remove Favorite' : 'Add Favorite'}
          </button>
          {user?.id === recipe.userId && (
            <>
              <button onClick={() => navigate(`/recipes/${recipe.id}/edit`)}>Edit</button>
              <button onClick={handleDelete} className="secondary">
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      <p>{recipe.description}</p>
      <p>
        <strong>Category:</strong> {recipe.category.name}
      </p>
      <p>
        <strong>Owner:</strong> {recipe.ownerName}
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
