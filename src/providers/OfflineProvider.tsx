
import React, { createContext, useContext, ReactNode } from 'react';
import { useNetworkState } from '@/hooks/useNetworkState';
import { useOfflineSyncManager } from '@/services/offline/offlineSyncService';
import { toast } from 'sonner';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isSyncing: false,
  pendingSyncCount: 0
});

export const useOfflineStatus = () => useContext(OfflineContext);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const isOnline = useNetworkState();
  const { isSyncing, syncCount } = useOfflineSyncManager();
  
  // Show a toast when the connection status changes
  React.useEffect(() => {
    if (isOnline) {
      toast.success("Connecté au réseau");
    } else {
      toast.warning("Mode hors-ligne activé", {
        description: "Les modifications seront synchronisées dès le retour de la connexion"
      });
    }
  }, [isOnline]);

  const value = {
    isOnline,
    isSyncing,
    pendingSyncCount: syncCount
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
      {!isOnline && (
        <div className="fixed top-0 right-0 p-2 m-4 bg-orange-100 text-orange-800 rounded-md shadow-md z-50 flex items-center gap-2">
          <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Mode hors-ligne</span>
        </div>
      )}
      {isSyncing && (
        <div className="fixed top-0 right-0 p-2 m-4 bg-blue-100 text-blue-800 rounded-md shadow-md z-50 flex items-center gap-2">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Synchronisation en cours...</span>
        </div>
      )}
    </OfflineContext.Provider>
  );
};
