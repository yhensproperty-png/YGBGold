import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient.ts';

interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'user';
  login_enabled: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  aal: 'aal1' | 'aal2' | null;
  hasMFAEnrolled: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshAAL: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
  aal: null,
  hasMFAEnrolled: false,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  refreshAAL: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) return null;
    return data as Profile | null;
  } catch {
    return null;
  }
};

const getAAL = async (): Promise<'aal1' | 'aal2' | null> => {
  try {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    return (data?.currentLevel as 'aal1' | 'aal2') ?? null;
  } catch {
    return null;
  }
};

const checkMFAEnrolled = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.mfa.listFactors();
    return (data?.totp?.some(f => f.status === 'verified')) ?? false;
  } catch {
    return false;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aal, setAal] = useState<'aal1' | 'aal2' | null>(null);
  const [hasMFAEnrolled, setHasMFAEnrolled] = useState(false);
  const initializedRef = useRef(false);

  const refreshAAL = async () => {
    const level = await getAAL();
    setAal(level);
    const enrolled = await checkMFAEnrolled();
    setHasMFAEnrolled(enrolled);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      (async () => {
        if (event === 'INITIAL_SESSION') {
          if (initializedRef.current) return;
          initializedRef.current = true;
          if (newSession?.user) {
            const p = await fetchProfile(newSession.user.id);
            if (p && !p.login_enabled) {
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              setProfile(null);
              setAal(null);
              setHasMFAEnrolled(false);
            } else {
              setSession(newSession);
              setUser(newSession.user);
              setProfile(p);
              const level = await getAAL();
              setAal(level);
              const enrolled = await checkMFAEnrolled();
              setHasMFAEnrolled(enrolled);
            }
          }
          setIsLoading(false);
          return;
        }

        if (event === 'SIGNED_IN') {
          if (newSession?.user) {
            const p = await fetchProfile(newSession.user.id);
            if (p && !p.login_enabled) {
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              setProfile(null);
              setAal(null);
              setHasMFAEnrolled(false);
            } else {
              setSession(newSession);
              setUser(newSession.user);
              setProfile(p);
              const level = await getAAL();
              setAal(level);
              const enrolled = await checkMFAEnrolled();
              setHasMFAEnrolled(enrolled);
            }
          }
          setIsLoading(false);
          return;
        }

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setAal(null);
          setHasMFAEnrolled(false);
          setIsLoading(false);
          return;
        }

        if (event === 'TOKEN_REFRESHED' && newSession) {
          setSession(newSession);
          const level = await getAAL();
          setAal(level);
        }

        if (event === 'MFA_CHALLENGE_VERIFIED') {
          const level = await getAAL();
          setAal(level);
          const enrolled = await checkMFAEnrolled();
          setHasMFAEnrolled(enrolled);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const p = await fetchProfile(data.user.id);
      if (p && !p.login_enabled) {
        await supabase.auth.signOut();
        return { error: 'Your account has been disabled. Please contact the administrator.' };
      }
      if (p) setProfile(p);
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      isAdmin: profile?.role === 'admin',
      isLoading,
      aal,
      hasMFAEnrolled,
      signIn,
      signOut,
      refreshAAL,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
