import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Initialize Supabase client
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, preferredName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updatePreferredName: (newName: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  enterDemoMode: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const isAuthenticated = user !== null || isDemoMode;

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check if in demo mode
      const demoModeFlag = localStorage.getItem('lunarDemoMode');
      if (demoModeFlag === 'true') {
        setIsDemoMode(true);
        setUser({
          id: 'demo-user',
          email: 'demo@lunarai.com',
          preferredName: 'Demo Student',
          createdAt: new Date().toISOString(),
        });
        setIsLoading(false);
        return;
      }

      const savedToken = localStorage.getItem('lunarAccessToken');
      const savedUser = localStorage.getItem('lunarUser');

      if (savedToken && savedUser) {
        setAccessToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, preferredName: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password, name: preferredName }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Signup failed' };
      }

      // After successful signup, sign in to get the session
      return await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/auth/signin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      // Store access token
      const token = data.session?.access_token;
      setAccessToken(token);
      localStorage.setItem('lunarAccessToken', token);

      // Fetch user profile
      await fetchUserProfile(token);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/auth/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email,
          preferredName: data.user.name || 'Student',
          createdAt: data.user.createdAt,
        };
        setUser(userData);
        localStorage.setItem('lunarUser', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const refreshUser = async () => {
    if (accessToken) {
      await fetchUserProfile(accessToken);
    }
  };

  const updatePreferredName = async (newName: string) => {
    if (!accessToken) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/auth/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ name: newName }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Update failed' };
      }

      // Update local user state
      if (user) {
        const updatedUser = { ...user, preferredName: newName };
        setUser(updatedUser);
        localStorage.setItem('lunarUser', JSON.stringify(updatedUser));
      }

      return { success: true };
    } catch (error) {
      console.error('Update name error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const enterDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem('lunarDemoMode', 'true');
    const demoUser: User = {
      id: 'demo-user',
      email: 'demo@lunarai.com',
      preferredName: 'Demo Student',
      createdAt: new Date().toISOString(),
    };
    setUser(demoUser);
    localStorage.setItem('lunarUser', JSON.stringify(demoUser));
  };

  const logout = async () => {
    setUser(null);
    setAccessToken(null);
    setIsDemoMode(false);
    localStorage.removeItem('lunarAccessToken');
    localStorage.removeItem('lunarUser');
    localStorage.removeItem('lunarDemoMode');
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
        updatePreferredName,
        refreshUser,
        enterDemoMode,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}