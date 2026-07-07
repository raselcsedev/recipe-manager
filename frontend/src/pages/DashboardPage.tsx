import { useEffect, useState } from 'react';
import { fetchDashboard, DashboardCounts } from '../api/api';

const DashboardPage = () => {
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard()
      .then(response => setCounts(response.data.data))
      .catch(err => setError(err?.response?.data?.message || 'Unable to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading dashboard...</div>;
  if (error) return <div className="card error">{error}</div>;
  if (!counts) return <div className="card">No data available.</div>;

  return (
    <div className="card dashboard-grid">
      <div>
        <h3>Total Recipes</h3>
        <p>{counts.totalRecipes}</p>
      </div>
      <div>
        <h3>Total Categories</h3>
        <p>{counts.totalCategories}</p>
      </div>
      <div>
        <h3>Total Ingredients</h3>
        <p>{counts.totalIngredients}</p>
      </div>
      <div>
        <h3>Favorite Recipes</h3>
        <p>{counts.favoriteRecipesCount}</p>
      </div>
    </div>
  );
};

export default DashboardPage;
