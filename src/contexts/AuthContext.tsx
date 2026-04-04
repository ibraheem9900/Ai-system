import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../lib/api';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.auth.me()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const { token, user } = await api.auth.signin(email, password);
    localStorage.setItem('auth_token', token);
    setUser(user);
  };

  const signUp = async (email: string, password: string) => {
    const { token, user } = await api.auth.signup(email, password);
    localStorage.setItem('auth_token', token);
    setUser(user);
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
