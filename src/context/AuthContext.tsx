import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  loginDemo: (email: string, role?: UserRole, name?: string) => User;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const validRoles: UserRole[] = ['user', 'manager', 'pharmacy', 'admin'];

const DEMO_SESSION_KEY = 'medilink_demo_session';

async function toAppUser(session: Session): Promise<User> {
  try {
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
  } catch {
    return {
      id: session.user.id,
      email: session.user.email ?? '',
      name: session.user.user_metadata?.name || session.user.email || 'MediLink User',
      role: 'user',
    };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Check local demo session first
    try {
      const storedDemo = localStorage.getItem(DEMO_SESSION_KEY);
      if (storedDemo) {
        const parsed = JSON.parse(storedDemo);
        if (parsed && parsed.user && parsed.token) {
          setUser(parsed.user);
          setToken(parsed.token);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed reading demo session from localStorage:', err);
    }

    // Skip network calls to Supabase if project is unconfigured
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    const applySession = async (session: Session | null) => {
      if (!session) {
        if (active) {
          const storedDemo = localStorage.getItem(DEMO_SESSION_KEY);
          if (!storedDemo) {
            setToken(null);
            setUser(null);
          }
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

    void supabase.auth.getSession()
      .then(({ data }) => applySession(data.session))
      .catch(() => {
        if (active) setIsLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const loginDemo = (email: string, role?: UserRole, name?: string): User => {
    let assignedRole: UserRole = role || 'user';
    let assignedName = name || 'Demo User';

    const lower = email.toLowerCase().trim();
    if (lower.includes('pharmacy') || lower.includes('manager')) {
      assignedRole = 'manager';
      assignedName = 'City Central Pharmacy';
    } else if (lower.includes('admin')) {
      assignedRole = 'admin';
      assignedName = 'System Administrator';
    } else if (lower.includes('patient') || lower.includes('sarah') || lower.includes('mousumi')) {
      assignedRole = 'user';
      assignedName = name || 'Mousumi Parida (Patient)';
    }

    const demoUser: User = {
      id: `demo_${Date.now()}`,
      email: lower,
      name: assignedName,
      role: assignedRole,
      phone: '+1 (555) 019-2834',
    };

    const demoToken = `demo_token_${Date.now()}`;
    const demoSession = { user: demoUser, token: demoToken };

    try {
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoSession));
    } catch (err) {
      console.warn('Failed saving demo session:', err);
    }

    setUser(demoUser);
    setToken(demoToken);
    return demoUser;
  };

  const logout = async () => {
    try {
      localStorage.removeItem(DEMO_SESSION_KEY);
    } catch (err) {
      console.warn('Failed removing demo session:', err);
    }

    setUser(null);
    setToken(null);

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        // Ignore Supabase signout network errors
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, logout, loginDemo, isAuthenticated: !!token && !!user, isLoading }}>
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
