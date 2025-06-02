
import React, { createContext, useContext, ReactNode } from 'react';
import { useSimpleAuth, SimpleAuthReturn } from '@/hooks/auth/useSimpleAuth';

const SimpleAuthContext = createContext<SimpleAuthReturn | undefined>(undefined);

interface SimpleAuthProviderProps {
  children: ReactNode;
}

export function SimpleAuthProvider({ children }: SimpleAuthProviderProps) {
  const auth = useSimpleAuth();
  
  return (
    <SimpleAuthContext.Provider value={auth}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export function useSimpleAuthContext() {
  const context = useContext(SimpleAuthContext);
  
  if (context === undefined) {
    throw new Error("useSimpleAuthContext doit être utilisé à l'intérieur d'un SimpleAuthProvider");
  }
  
  return context;
}
