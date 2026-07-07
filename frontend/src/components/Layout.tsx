import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <Link to="/">Recipe Manager</Link>
        </div>
        <nav>
          <Link to="/">Recipes</Link>
          {user && <Link to="/create">Create Recipe</Link>}
          <Link to="/favorites">Favorites</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          {user ? <button onClick={logout}>Logout</button> : <Link to="/login">Login</Link>}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
