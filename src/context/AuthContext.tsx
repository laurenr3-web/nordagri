
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Define the type for the auth context
interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  profileData: any;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

// Create the auth context with initial undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the auth provider component
interface AuthProviderProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Auth provider component that makes auth state available throughout the app
 */
export function AuthProvider({ 
  children, 
  requireAuth = false, 
  redirectTo 
}: AuthProviderProps) {
  // Using the existing useAuth hook
  const auth = useAuth(requireAuth, redirectTo);
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use the auth context
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  
  return context;
}
