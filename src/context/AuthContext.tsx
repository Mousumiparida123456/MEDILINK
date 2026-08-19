import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'user' | 'pharmacy' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USERS: Record<UserRole, User> = {
  user: {
    id: 'demo_user_1',
    name: 'Demo Patient (Om)',
    email: 'patient@medilink.com',
    role: 'user',
    phone: '+1 (555) 019-2834',
  },
  pharmacy: {
    id: 'demo_pharmacy_1',
    name: 'City Central Pharmacy',
    email: 'pharmacy@medilink.com',
    role: 'pharmacy',
    phone: '+1 (555) 890-1234',
  },
  admin: {
    id: 'demo_admin_1',
    name: 'System Administrator',
    email: 'admin@medilink.com',
    role: 'admin',
    phone: '+1 (555) 999-0000',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

