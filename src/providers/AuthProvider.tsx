
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Session } from '@supabase/supabase-js';

// Define the type for authentication context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profileData: any;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

// Create context with an empty default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the authentication provider
interface AuthProviderProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Authentication provider that makes authentication state available in the application
 */
export function AuthProvider({ 
  children, 
  requireAuth = true, // Changed default to true to require authentication by default
  redirectTo = '/' 
}: AuthProviderProps) {
  const auth = useAuth(requireAuth, redirectTo);
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context in components
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuthContext must be used inside an AuthProvider");
  }
  
  return context;
}
