
import React, { useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';

export interface ProfileData {
  id: string;
  first_name?: string;
  last_name?: string;
  farm_id?: string;
  role?: string;
  email?: string;
}

export interface AuthStateReturn {
  user: User | null;
  setUser: (user: User | null) => void;
  session: Session | null;
  setSession: (session: Session | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  profileData: ProfileData | null;
  setProfileData: (profileData: ProfileData | null) => void;
  isAuthenticated: boolean;
}

/**
 * Hook to manage authentication state with proper React imports
 */
export function useAuthState(): AuthStateReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const isAuthenticated = !!user && !!session;

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
