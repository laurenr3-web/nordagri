
import React, { createContext, useContext, ReactNode } from 'react';
import { useOfflineMode } from '@/hooks/useOfflineMode';

interface OfflineContextType {
  isOnline: boolean;
  saveOfflineData: <T>(type: 'time_sessions' | 'fuel_logs', data: T, id?: string) => string;
  getOfflineData: <T>(type: 'time_sessions' | 'fuel_logs', id?: string) => T[];
  syncOfflineData: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error("useOffline must be used within an OfflineProvider");
  }
  return context;
};

export function OfflineProvider({ children }: { children: ReactNode }) {
  const offlineMode = useOfflineMode();
  
  return (
    <OfflineContext.Provider value={offlineMode}>
      {children}
    </OfflineContext.Provider>
  );
}
