
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { AuthContextValue } from './types';

// Create context with default undefined value
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Props for the auth provider
interface AuthProviderProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Authentication Provider that makes auth state available throughout the app
 */
export function AuthProvider({ 
  children, 
  requireAuth = false,
  redirectTo 
}: AuthProviderProps) {
  const auth = useAuth(requireAuth, redirectTo);
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use the authentication context
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  
  return context;
}
