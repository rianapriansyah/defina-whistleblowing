import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import supabase from '../utils/supabase';
import { isAdminUser } from '../utils/authRole';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** True when `app_metadata.role === 'admin'` (set in Supabase Dashboard or via service role). */
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: { message: string } | null; alreadyRegistered?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? { message: error.message } : null };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    // Supabase may return no error but empty identities when email already exists (e.g. when confirm email is on)
    const isAlreadyRegistered =
      (error && /already registered|already exists|user already exists/i.test(error.message)) ||
      (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0);
    if (isAlreadyRegistered) {
      return {
        error: { message: 'This email is already registered. Please sign in instead.' },
        alreadyRegistered: true,
      };
    }
    return {
      error: error ? { message: error.message } : null,
      alreadyRegistered: false,
    };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextValue = {
    user,
    session,
    loading,
    isAdmin: isAdminUser(user),
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
