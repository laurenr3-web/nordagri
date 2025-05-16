
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { syncService, SyncStatus } from '@/services/syncService';
import { toast } from 'sonner';
import { Database, CloudOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSyncStatus } from '@/hooks/useOfflineQuery';
import { supabase } from '@/integrations/supabase/client';

// Initialiser le service avec le client Supabase
syncService.setSupabaseClient(supabase);

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  syncNow: () => Promise<any>;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isSyncing: false,
  pendingSyncCount: 0,
  syncNow: async () => {}
});

export const useOfflineStatus = () => useContext(OfflineContext);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const { isOnline, isSyncing, pendingSyncCount, syncNow } = useSyncStatus();
  
  // Démarrer la synchronisation périodique
  useEffect(() => {
    syncService.startPeriodicSync(60000); // Toutes les minutes
    
    return () => {
      syncService.stopPeriodicSync();
    };
  }, []);
  
  // Afficher un toast lors du changement d'état de connexion
  useEffect(() => {
    const handleConnectionChange = (status: SyncStatus) => {
      if (status.isOnline) {
        toast.success("Connecté au réseau");
      } else {
        toast.warning("Mode hors-ligne activé", {
          description: "Les modifications seront synchronisées dès que possible"
        });
      }
    };
    
    syncService.addEventListener('statusChange', handleConnectionChange);
    
    return () => {
      syncService.removeEventListener('statusChange', handleConnectionChange);
    };
  }, []);
  
  const value = {
    isOnline,
    isSyncing,
    pendingSyncCount,
    syncNow
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
      {pendingSyncCount > 0 && !isOnline && (
        <div className="fixed bottom-4 right-4 max-w-md z-40">
          <Alert variant="warning" className="border-orange-400 shadow-lg">
            <Database className="h-4 w-4" />
            <AlertTitle>Données non synchronisées</AlertTitle>
            <AlertDescription className="text-xs">
              {pendingSyncCount} modification(s) seront synchronisée(s) lorsque vous serez connecté.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </OfflineContext.Provider>
  );
};
