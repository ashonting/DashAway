'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import Toast from '@/app/Toast';
import { useRouter } from 'next/navigation';

interface Subscription {
  id: number;
  paddle_subscription_id: string;
  status: string;
}

interface User {
  id: number;
  email: string;
  usage_count: number;
  subscriptions: Subscription[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  setToastMessage: (message: string) => void;
  setShowToast: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
          // Only show toast for non-401 errors (401 is expected when not logged in)
          if (res.status !== 401) {
            const errorData = await res.json();
            setToastMessage(errorData.detail || 'Failed to fetch user data');
            setShowToast(true);
          }
        }
      } catch (error) {
        setUser(null);
        setToastMessage('Network error or server is unreachable');
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = (token: string) => {
    // The backend will set the httpOnly cookie. Here we just update the user state.
    const fetchUser = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            router.push('/dashboard');
          } else {
            setUser(null);
            const errorData = await res.json();
            setToastMessage(errorData.detail || 'Login failed');
            setShowToast(true);
          }
        } catch (error) {
          setUser(null);
          setToastMessage('Network error or server is unreachable');
          setShowToast(true);
        }
      };
      fetchUser();
  };

  const logout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setToastMessage, setShowToast }}>
      {children}
      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
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
