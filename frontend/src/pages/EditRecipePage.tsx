import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchRecipe, fetchCategories, fetchIngredients, updateRecipe, RecipeDetail } from '../api/api';

const EditRecipePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [ingredients, setIngredients] = useState([{ ingredientId: '', quantity: '' }]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [availableIngredients, setAvailableIngredients] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    Promise.all([fetchRecipe(id), fetchCategories({ page: 1, limit: 50 }), fetchIngredients({ page: 1, limit: 50 })])
      .then(([recipeRes, categoriesRes, ingredientsRes]) => {
        const recipeData = recipeRes.data.data as RecipeDetail;
        setRecipe(recipeData);
        setTitle(recipeData.title);
        setDescription(recipeData.description || '');
        setInstructions(recipeData.instructions);
        setCategoryId(recipeData.category.id);
        setIngredients(recipeData.ingredients.map(item => ({ ingredientId: item.id, quantity: item.quantity })));
        setCategories(categoriesRes.data.data);
        setAvailableIngredients(ingredientsRes.data.data);
      })
      .catch(err => setError(err?.response?.data?.message || 'Unable to load recipe data'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleIngredientChange = (index: number, field: 'ingredientId' | 'quantity', value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addIngredientRow = () => setIngredients([...ingredients, { ingredientId: '', quantity: '' }]);

  const removeIngredientRow = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;
    setError('');

    try {
      await updateRecipe(id, {
        title,
        description,
        instructions,
        categoryId,
        ingredients: ingredients.filter(item => item.ingredientId && item.quantity),
      });
      navigate(`/recipes/${id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to update recipe');
    }
  };

  if (loading) return <div className="card">Loading recipe...</div>;
  if (error) return <div className="card error">{error}</div>;
  if (!recipe) return <div className="card">Recipe not found</div>;

  return (
    <div className="card">
      <h2>Edit Recipe</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <label>
          Title
          <input value={title} onChange={e => setTitle(e.target.value)} required />
        </label>
        <label>
          Description
          <textarea value={description} onChange={e => setDescription(e.target.value)} />
        </label>
        <label>
          Instructions
          <textarea value={instructions} onChange={e => setInstructions(e.target.value)} required />
        </label>
        <label>
          Category
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
            <option value="">Select category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>Ingredients</legend>
          {ingredients.map((item, index) => (
            <div key={index} className="ingredient-row">
              <select
                value={item.ingredientId}
                onChange={e => handleIngredientChange(index, 'ingredientId', e.target.value)}
                required
              >
                <option value="">Select ingredient</option>
                {availableIngredients.map(ingredient => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name}
                  </option>
                ))}
              </select>
              <input
                placeholder="Quantity"
                value={item.quantity}
                onChange={e => handleIngredientChange(index, 'quantity', e.target.value)}
                required
              />
              <button type="button" onClick={() => removeIngredientRow(index)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addIngredientRow}>
            Add Ingredient
          </button>
        </fieldset>
        {error && <div className="error">{error}</div>}
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default EditRecipePage;
