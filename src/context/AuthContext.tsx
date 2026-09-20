import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const validRoles: UserRole[] = ['user', 'manager', 'pharmacy', 'admin'];

async function toAppUser(session: Session): Promise<User> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role, phone')
    .eq('id', session.user.id)
    .maybeSingle();

  const role = validRoles.includes(profile?.role as UserRole)
    ? profile!.role as UserRole
    : 'user';

  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: profile?.name || session.user.user_metadata?.name || session.user.email || 'MediLink User',
    role,
    phone: profile?.phone || session.user.user_metadata?.phone,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const applySession = async (session: Session | null) => {
      if (!session) {
        if (active) {
          setToken(null);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      const appUser = await toAppUser(session);
      if (active) {
        setToken(session.access_token);
        setUser(appUser);
        setIsLoading(false);
      }
    };

    void supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, token, logout, isAuthenticated: !!token && !!user, isLoading }}>
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
