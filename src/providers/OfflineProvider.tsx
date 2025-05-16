
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useNetworkState } from '@/hooks/useNetworkState';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { toast } from 'sonner';
import { Database, Save, CloudOff, Cloud } from 'lucide-react';
import { SyncOperationType } from '@/services/offline/offlineSyncService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useIndexedDBInitialization } from '@/hooks/useIndexedDBInitialization';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  addToSyncQueue: (type: SyncOperationType, data: any, tableName: string) => Promise<string>;
  syncNow: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isSyncing: false,
  pendingSyncCount: 0,
  addToSyncQueue: async () => '',
  syncNow: async () => {}
});

export const useOfflineStatus = () => useContext(OfflineContext);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const isOnline = useNetworkState();
  const { isSyncing, syncCount, addToSyncQueue, syncNow } = useOfflineSync(true, true);
  const { isInitialized, error: dbError } = useIndexedDBInitialization();
  
  // Show a toast when the connection status changes
  useEffect(() => {
    if (isOnline) {
      toast.success("Connecté au réseau", {
        icon: <Cloud size={16} />
      });
    } else {
      toast.warning("Mode hors-ligne activé", {
        description: "Les modifications seront synchronisées dès le retour de la connexion",
        icon: <CloudOff size={16} />
      });
    }
  }, [isOnline]);
  
  // Show error if IndexedDB initialization failed
  useEffect(() => {
    if (dbError) {
      toast.error("Erreur d'initialisation du mode hors-ligne", {
        description: dbError.message,
      });
    }
  }, [dbError]);
  
  // Trigger sync when coming back online
  useEffect(() => {
    if (isOnline && syncCount > 0 && !isSyncing && isInitialized) {
      syncNow();
    }
  }, [isOnline, syncCount, isSyncing, syncNow, isInitialized]);
  
  const value = {
    isOnline,
    isSyncing,
    pendingSyncCount: syncCount,
    addToSyncQueue,
    syncNow: async () => {
      if (isInitialized) {
        await syncNow();
      } else {
        toast.error("Mode hors-ligne non initialisé");
      }
    }
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
      {!isOnline && (
        <div className="fixed top-0 right-0 p-2 m-4 bg-orange-100 text-orange-800 rounded-md shadow-md z-50 flex items-center gap-2">
          <CloudOff className="h-4 w-4" />
          <span className="text-sm font-medium">Mode hors-ligne</span>
        </div>
      )}
      {syncCount > 0 && !isSyncing && isOnline && (
        <div className="fixed top-0 right-0 p-2 m-4 bg-blue-100 text-blue-800 rounded-md shadow-md z-50 flex items-center gap-2 cursor-pointer"
             onClick={() => syncNow()}>
          <Database className="h-4 w-4" />
          <span className="text-sm font-medium">{syncCount} action(s) en attente</span>
        </div>
      )}
      {isSyncing && (
        <div className="fixed top-0 right-0 p-2 m-4 bg-blue-100 text-blue-800 rounded-md shadow-md z-50 flex items-center gap-2">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Synchronisation en cours...</span>
        </div>
      )}
      {!isOnline && syncCount > 0 && (
        <div className="fixed bottom-4 right-4 max-w-md z-40">
          <Alert variant="warning" className="border-orange-400 shadow-lg">
            <Save className="h-4 w-4" />
            <AlertTitle>Données non synchronisées</AlertTitle>
            <AlertDescription className="text-xs">
              {syncCount} modification(s) seront synchronisée(s) lorsque vous serez connecté.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </OfflineContext.Provider>
  );
};
