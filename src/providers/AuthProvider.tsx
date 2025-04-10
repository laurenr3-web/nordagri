
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Session } from '@supabase/supabase-js';

// Définir le type pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profileData: any;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

// Créer le contexte avec une valeur par défaut vide
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props pour le fournisseur d'authentification
interface AuthProviderProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Fournisseur d'authentification qui rend l'état d'authentification disponible dans l'application
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
 * Hook pour utiliser le contexte d'authentification dans les composants
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuthContext doit être utilisé à l'intérieur d'un AuthProvider");
  }
  
  return context;
}
