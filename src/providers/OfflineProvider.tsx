
import React, { createContext, useContext, ReactNode, useEffect, useCallback } from 'react';
import { syncService, SyncStatus } from '@/services/syncService';
import { toast } from 'sonner';
import { Database, CloudOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSyncStatus } from '@/hooks/useOfflineQuery';
import { supabase } from '@/integrations/supabase/client';

// Initialiser le service avec le client Supabase
syncService.setSupabaseClient(supabase);

// Extended SyncOperationType to include string literals used in useInterventionsWithOffline.ts
export type SyncOperationType = 
  | 'create' | 'update' | 'delete'  // Base operations from syncService
  | 'add_intervention' | 'update_intervention' | 'delete_intervention'  // Intervention operations
  | 'add_time_entry' | 'update_time_entry' | 'delete_time_entry';  // Time entry operations

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  syncNow: () => Promise<any>;
  addToSyncQueue: (operation: SyncOperationType, data: any, tableName: string, entityId?: string | number) => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isSyncing: false,
  pendingSyncCount: 0,
  syncNow: async () => {},
  addToSyncQueue: async () => {}
});

export const useOfflineStatus = () => useContext(OfflineContext);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const { isOnline, isSyncing, pendingSyncCount, syncNow } = useSyncStatus();
  
  // Fonction pour ajouter une opération à la file d'attente de synchronisation
  const addToSyncQueue = useCallback(
    async (operation: SyncOperationType, data: any, tableName: string, entityId?: string | number): Promise<void> => {
      try {
        switch (operation) {
          case 'create':
            await syncService.create(tableName, data);
            break;
          case 'update':
            if (!entityId) throw new Error('Entity ID required for update operation');
            await syncService.update(tableName, entityId, data);
            break;
          case 'delete':
            if (!entityId) throw new Error('Entity ID required for delete operation');
            await syncService.delete(tableName, entityId);
            break;
          default:
            throw new Error(`Unsupported operation type: ${operation}`);
        }
      } catch (error) {
        console.error('Error adding operation to sync queue:', error);
        toast.error('Erreur lors de l\'ajout à la file d\'attente', {
          description: error.message
        });
        throw error;
      }
    },
    []
  );
  
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
    syncNow,
    addToSyncQueue
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
