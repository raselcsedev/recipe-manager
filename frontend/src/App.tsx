import { Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import RecipeListPage from './pages/RecipeListPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CreateRecipePage from './pages/CreateRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import AuthRoute from './components/AuthRoute';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RecipeListPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        <Route path="/recipes/:id/edit" element={<AuthRoute><EditRecipePage /></AuthRoute>} />
        <Route path="/create" element={<AuthRoute><CreateRecipePage /></AuthRoute>} />
        <Route path="/favorites" element={<AuthRoute><FavoritesPage /></AuthRoute>} />
        <Route path="/dashboard" element={<AuthRoute><DashboardPage /></AuthRoute>} />
        <Route path="/profile" element={<AuthRoute><ProfilePage /></AuthRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
