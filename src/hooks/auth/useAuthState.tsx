
import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';

export interface ProfileData {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  farm_id?: string;
  has_seen_onboarding?: boolean;
  created_at: string;
  updated_at: string;
  // Note: email is not stored in profiles table, it comes from auth.users
}

export interface AuthStateReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profileData: ProfileData | null;
  isAuthenticated: boolean;
}

/**
 * Hook to manage authentication state
 */
export function useAuthState(): AuthStateReturn & {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setProfileData: (data: ProfileData | null) => void;
} {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const isAuthenticated = !!user;

  return {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    profileData,
    setProfileData,
    isAuthenticated,
  };
}
