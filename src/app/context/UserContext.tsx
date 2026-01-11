import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface User {
  id: string;
  email: string;
  preferredName: string;
  createdAt: string;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    preferredName: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  enterDemoMode: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const isAuthenticated = user !== null || isDemoMode;

  // Restore session on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem('lunarUser');
    const demoMode = localStorage.getItem('lunarDemoMode') === 'true';

    if (demoMode) {
      setIsDemoMode(true);
      setUser({
        id: 'demo-user',
        email: 'demo@lunarai.com',
        preferredName: 'Demo Student',
        createdAt: new Date().toISOString(),
      });
    } else if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    setIsLoading(false);
  }, []);

  // 🔐 LOGIN (FIXED)
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/auth/signin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.user || !data.session) {
        return { success: false, error: data.error || 'Login failed' };
      }

      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        preferredName: data.user.user_metadata?.name || 'Student',
        createdAt: data.user.created_at,
      };

      setUser(userData);
      localStorage.setItem('lunarUser', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // 📝 SIGN UP
  const signup = async (
    email: string,
    password: string,
    preferredName: string
  ) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email,
            password,
            name: preferredName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Signup failed' };
      }

      // Auto-login after signup
      return await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // 🚪 LOGOUT
  const logout = async () => {
    setUser(null);
    setIsDemoMode(false);
    localStorage.removeItem('lunarUser');
    localStorage.removeItem('lunarDemoMode');
  };

  // 🎮 DEMO MODE
  const enterDemoMode = () => {
    setIsDemoMode(true);
    const demoUser: User = {
      id: 'demo-user',
      email: 'demo@lunarai.com',
      preferredName: 'Demo Student',
      createdAt: new Date().toISOString(),
    };
    setUser(demoUser);
    localStorage.setItem('lunarDemoMode', 'true');
    localStorage.setItem('lunarUser', JSON.stringify(demoUser));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isDemoMode,
        login,
        signup,
        logout,
        enterDemoMode,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
