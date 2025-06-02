
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';

interface DemoContextType {
  isDemoMode: boolean;
  setDemoMode: (isDemo: boolean) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const useDemoMode = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoDataProvider');
  }
  return context;
};

interface DemoDataProviderProps {
  children: React.ReactNode;
}

export const DemoDataProvider: React.FC<DemoDataProviderProps> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { user } = useAuthContext();

  // Vérifier si l'utilisateur connecté est le compte de démonstration
  useEffect(() => {
    if (user?.email === 'demo@optitractor.com') {
      setIsDemoMode(true);
      console.log('Mode démonstration activé');
    } else {
      setIsDemoMode(false);
    }
  }, [user]);

  const setDemoMode = (isDemo: boolean) => {
    setIsDemoMode(isDemo);
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, setDemoMode }}>
      {children}
    </DemoContext.Provider>
  );
};
