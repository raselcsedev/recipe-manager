import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addRecipe, fetchCategories, fetchIngredients } from '../api/api';

const CreateRecipePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [ingredients, setIngredients] = useState([{ ingredientId: '', quantity: '' }]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [availableIngredients, setAvailableIngredients] = useState<Array<{ id: string; name: string }>>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories({ page: 1, limit: 50 })
      .then(response => setCategories(response.data.data))
      .catch(() => setError('Unable to load categories'));

    fetchIngredients({ page: 1, limit: 50 })
      .then(response => setAvailableIngredients(response.data.data))
      .catch(() => setError('Unable to load ingredients'));
  }, []);

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
    setError('');

    try {
      await addRecipe({
        title,
        description,
        instructions,
        categoryId,
        ingredients: ingredients.filter(item => item.ingredientId && item.quantity),
      });
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to create recipe');
    }
  };

  return (
    <div className="card">
      <h2>Create Recipe</h2>
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
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateRecipePage;
