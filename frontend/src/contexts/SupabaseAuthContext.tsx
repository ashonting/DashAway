'use client';

import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import Toast from '@/app/Toast';
import { useRouter } from 'next/navigation';
import { analytics } from '@/lib/analytics';

interface UserProfile {
  id: number;
  email: string;
  usage_count: number;
  subscriptions: any[];
  is_pro?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  setToastMessage: (message: string) => void;
  setShowToast: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  const fetchUserProfile = useCallback(async (supabaseUser: User) => {
    try {
      // Get the JWT token to send to backend
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          // Set analytics user ID
          analytics.setUserId(userData.id.toString());
        } else if (res.status === 404) {
          // User doesn't exist in backend, create them
          await createBackendUser(supabaseUser, session.access_token);
        } else {
          console.error('Failed to fetch user profile:', res.status);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  const createBackendUser = async (supabaseUser: User, token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: supabaseUser.email,
          supabase_id: supabaseUser.id,
        }),
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        console.error('Failed to create backend user:', res.status);
        setUser(null);
      }
    } catch (error) {
      console.error('Error creating backend user:', error);
      setUser(null);
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google OAuth sign-in...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?t=${Date.now()}`,
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        setToastMessage(`Google sign-in failed: ${error.message}`);
        setShowToast(true);
      }
    } catch (error) {
      console.error('Exception during OAuth:', error);
      setToastMessage(`Error signing in with Google: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowToast(true);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Starting email/password sign-in...');
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Email sign-in error:', error);
        setToastMessage(`Sign in error: ${error?.message || 'Unknown error'}`);
        setShowToast(true);
        return false;
      } else if (data.user) {
        console.log('Email sign-in successful');
        // Track successful login
        analytics.userLogin('email');
        // Immediately fetch user profile to update state
        await fetchUserProfile(data.user);
        setToastMessage('Successfully signed in! Redirecting to dashboard...');
        setShowToast(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Exception during email sign-in:', error);
      setToastMessage(`Error signing in: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowToast(true);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Starting email/password sign-up...');
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Email sign-up error:', error);
        setToastMessage(`Sign up error: ${error?.message || 'Unknown error'}`);
        setShowToast(true);
        return false;
      } else if (data.user) {
        console.log('Email sign-up successful');
        if (data.user.email_confirmed_at) {
          // Immediately fetch user profile to update state
          await fetchUserProfile(data.user);
          setToastMessage('Account created successfully!');
          setShowToast(true);
          return true;
        } else {
          setToastMessage('Please check your email to confirm your account.');
          setShowToast(true);
          return false; // Don't redirect if email needs confirmation
        }
      }
      return false;
    } catch (error) {
      console.error('Exception during email sign-up:', error);
      setToastMessage(`Error creating account: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowToast(true);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Starting password reset...');
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        console.error('Password reset error:', error);
        setToastMessage(`Password reset error: ${error?.message || 'Unknown error'}`);
        setShowToast(true);
      } else {
        setToastMessage('Password reset email sent! Check your inbox.');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Exception during password reset:', error);
      setToastMessage(`Error sending reset email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setToastMessage(error instanceof Error ? error.message : 'Unknown error');
        setShowToast(true);
      } else {
        setUser(null);
        router.push('/');
      }
    } catch (error) {
      setToastMessage('Error signing out');
      setShowToast(true);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser, 
      session, 
      loading, 
      signInWithGoogle, 
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
      signOut, 
      setToastMessage, 
      setShowToast 
    }}>
      {children}
      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}