
import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';

/**
 * Interface for profile data
 */
interface ProfileData {
  id: string;
  first_name?: string;
  last_name?: string;
  [key: string]: any; // For other potential profile fields
}

/**
 * Interface for auth state
 */
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profileData: ProfileData | null;
  isAuthenticated: boolean;
}

/**
 * Interface for auth state handlers
 */
interface AuthStateHandlers {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setProfileData: (profileData: ProfileData | null) => void;
}

/**
 * Combined interface for auth state and handlers
 */
export interface AuthStateReturn extends AuthState, AuthStateHandlers {}

/**
 * Hook to manage authentication state
 */
export function useAuthState(): AuthStateReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  return {
    // State
    user, 
    session,
    loading,
    profileData,
    isAuthenticated: !!user,
    
    // State updaters
    setUser,
    setSession,
    setLoading,
    setProfileData
  };
}
