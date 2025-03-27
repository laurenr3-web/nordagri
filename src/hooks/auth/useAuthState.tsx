
import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';

/**
 * Hook to manage authentication state
 */
export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  return {
    user, 
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    profileData,
    setProfileData,
    isAuthenticated: !!user
  };
}
