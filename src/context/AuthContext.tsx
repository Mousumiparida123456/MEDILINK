import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'user' | 'manager' | 'pharmacy' | 'admin';

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

export const DEMO_USERS: Record<string, User & { password: string }> = {
  user: {
    id: 'demo_user_1',
    name: 'Sarah Jenkins (Patient)',
    email: 'user@medilink.com',
    password: 'user123',
    role: 'user',
    phone: '+1 (555) 019-2834',
  },
  patient_alt: {
    id: 'demo_user_2',
    name: 'Om Kumar',
    email: 'patient@medilink.com',
    password: 'patient123',
    role: 'user',
    phone: '+1 (555) 019-2834',
  },
  manager: {
    id: 'demo_manager_1',
    name: 'Alex Rivera (Platform Manager)',
    email: 'manager@medilink.com',
    password: 'manager123',
    role: 'manager',
    phone: '+1 (555) 890-1234',
  },
  admin: {
    id: 'demo_admin_1',
    name: 'System Administrator',
    email: 'admin@medilink.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1 (555) 999-0000',
  },
  pharmacy: {
    id: 'demo_pharmacy_1',
    name: 'City Central Pharmacy Manager',
    email: 'pharmacy@medilink.com',
    password: 'pharmacy123',
    role: 'pharmacy',
    phone: '+1 (555) 890-5678',
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.id && parsedUser.role) {
          setToken(storedToken);
          setUser(parsedUser);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
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
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token && !!user }}>
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


