import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loginUser, registerUser, logoutUser, refreshToken, fetchProfile, setAccessToken } from '../api/api';

interface UserState {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: UserState | null;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = window.localStorage.getItem('recipe-user');
    const storedToken = window.localStorage.getItem('recipe-token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
      setLoading(false);
      return;
    }

    if (storedUser) {
      refreshToken()
        .then(response => {
          const accessToken = response.data.data.accessToken;
          setAccessToken(accessToken);
          window.localStorage.setItem('recipe-token', accessToken);
          return fetchProfile();
        })
        .then(profileResponse => {
          setUser(profileResponse.data.data);
          window.localStorage.setItem('recipe-user', JSON.stringify(profileResponse.data.data));
        })
        .catch(() => {
          window.localStorage.removeItem('recipe-user');
          window.localStorage.removeItem('recipe-token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const response = await loginUser(data);
    const userData = response.data.data.user;
    const accessToken = response.data.data.accessToken;
    setUser(userData);
    setAccessToken(accessToken);
    window.localStorage.setItem('recipe-user', JSON.stringify(userData));
    window.localStorage.setItem('recipe-token', accessToken);
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    const response = await registerUser(data);
    const userData = response.data.data.user;
    const accessToken = response.data.data.accessToken;
    setUser(userData);
    setAccessToken(accessToken);
    window.localStorage.setItem('recipe-user', JSON.stringify(userData));
    window.localStorage.setItem('recipe-token', accessToken);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    window.localStorage.removeItem('recipe-user');
    window.localStorage.removeItem('recipe-token');
    setAccessToken(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
