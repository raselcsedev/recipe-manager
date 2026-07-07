import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="card">Checking authentication...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default AuthRoute;
