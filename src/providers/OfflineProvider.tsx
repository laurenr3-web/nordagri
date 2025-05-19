
import React, { createContext, useContext, ReactNode, useEffect, useCallback, useState } from 'react';
import { OfflineSyncService, SyncResult } from '@/services/offline/offlineSyncService';
import { toast } from 'sonner';
import { Database, CloudOff, Cloud } from 'lucide-react';
import { OfflineSyncIndicator } from '@/components/offline/OfflineSyncIndicator';
import { useNetworkState } from '@/hooks/useNetworkState';
import { IndexedDBService } from '@/services/offline/indexedDBService';
import { supabase } from '@/integrations/supabase/client';

// Extended SyncOperationType to include string literals used in useInterventionsWithOffline.ts
export type SyncOperationType = 
  | 'create' | 'update' | 'delete'  // Base operations from syncService
  | 'add_intervention' | 'update_intervention' | 'delete_intervention'  // Intervention operations
  | 'add_time_entry' | 'update_time_entry' | 'delete_time_entry';  // Time entry operations

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  lastSyncTime: Date | null;
  syncNow: () => Promise<SyncResult[]>;
  addToSyncQueue: (operation: SyncOperationType, data: any, tableName: string, options?: {
    priority?: number;
    dependsOn?: string[];
    conflictStrategy?: 'client-wins' | 'server-wins' | 'manual-resolution';
  }) => Promise<string>;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isSyncing: false,
  pendingSyncCount: 0,
  lastSyncTime: null,
  syncNow: async () => [],
  addToSyncQueue: async () => ""
});

export const useOfflineStatus = () => useContext(OfflineContext);

interface OfflineProviderProps {
  children: ReactNode;
  autoSyncInterval?: number; // Interval in milliseconds for auto-sync
  showOfflineIndicator?: boolean; // Whether to show the offline indicator
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ 
  children, 
  autoSyncInterval = 60000,
  showOfflineIndicator = true
}) => {
  const isOnline = useNetworkState();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncIntervalId, setSyncIntervalId] = useState<number | null>(null);
  
  // Load pending sync count on mount and when network status changes
  useEffect(() => {
    const updateSyncCount = async () => {
      try {
        const count = await OfflineSyncService.getPendingSyncCount();
        setPendingSyncCount(count);
      } catch (error) {
        console.error('Error getting pending sync count:', error);
      }
    };
    
    updateSyncCount();
    
    // Update count every 30 seconds
    const intervalId = window.setInterval(updateSyncCount, 30000);
    
    return () => {
      window.clearInterval(intervalId);
    };
  }, [isOnline]);
  
  // Set up periodic sync when online
  useEffect(() => {
    // Clear any existing interval
    if (syncIntervalId) {
      OfflineSyncService.clearPeriodicSync(syncIntervalId);
    }
    
    if (isOnline) {
      const id = OfflineSyncService.schedulePeriodicSync(autoSyncInterval);
      setSyncIntervalId(id);
    }
    
    return () => {
      if (syncIntervalId) {
        OfflineSyncService.clearPeriodicSync(syncIntervalId);
      }
    };
  }, [isOnline, autoSyncInterval]);
  
  // Function to add an operation to the sync queue
  const addToSyncQueue = useCallback(
    async (
      operation: SyncOperationType, 
      data: any, 
      tableName: string,
      options?: {
        priority?: number;
        dependsOn?: string[];
        conflictStrategy?: 'client-wins' | 'server-wins' | 'manual-resolution';
      }
    ): Promise<string> => {
      try {
        // First, try to perform the operation directly if online
        if (isOnline && supabase) {
          try {
            switch (operation) {
              case 'create':
              case 'add_intervention':
              case 'add_time_entry': {
                // Remove any temporary ID
                const { id, ...dataToInsert } = 
                  typeof data === 'object' && data !== null && 'id' in data && 
                  typeof data.id === 'string' && data.id.startsWith('local_') 
                    ? data 
                    : { id: undefined, ...data };
                
                const { data: result, error } = await supabase
                  .from(tableName as any)
                  .insert(dataToInsert)
                  .select()
                  .single();
                  
                if (!error) {
                  return result.id;
                }
                break;
              }
              case 'update':
              case 'update_intervention':
              case 'update_time_entry': {
                // Extract ID and update data
                const { id, ...dataToUpdate } = data;
                
                if (id) {
                  const { data: result, error } = await supabase
                    .from(tableName as any)
                    .update(dataToUpdate)
                    .eq('id', id)
                    .select()
                    .single();
                    
                  if (!error) {
                    return id.toString();
                  }
                }
                break;
              }
              case 'delete':
              case 'delete_intervention':
              case 'delete_time_entry': {
                const id = typeof data === 'object' ? data.id : data;
                
                if (id) {
                  const { error } = await supabase
                    .from(tableName as any)
                    .delete()
                    .eq('id', id);
                    
                  if (!error) {
                    return id.toString();
                  }
                }
                break;
              }
            }
          } catch (error) {
            console.warn('Error with online operation, falling back to offline queue:', error);
            // Continue to offline queue
          }
        }
        
        // If we're here, either we're offline or the online operation failed
        const id = await OfflineSyncService.addToSyncQueue(operation, data, tableName, options);
        
        // Update pending count
        const count = await OfflineSyncService.getPendingSyncCount();
        setPendingSyncCount(count);
        
        return id;
      } catch (error) {
        console.error('Error adding to sync queue:', error);
        toast.error('Erreur lors de l\'ajout à la file d\'attente', {
          description: error.message
        });
        throw error;
      }
    },
    [isOnline]
  );
  
  // Function to manually trigger synchronization
  const syncNow = useCallback(async (): Promise<SyncResult[]> => {
    if (!isOnline) {
      toast.warning("Synchronisation impossible", {
        description: "Vous êtes hors connexion. Réessayez quand vous serez connecté."
      });
      return [];
    }
    
    if (isSyncing) {
      toast.info("Synchronisation déjà en cours...");
      return [];
    }
    
    try {
      setIsSyncing(true);
      
      toast.loading("Synchronisation en cours...");
      
      const results = await OfflineSyncService.processSyncQueue(
        (current, total) => {
          toast.loading(`Synchronisation en cours... (${current}/${total})`);
        }
      );
      
      // Count successful and failed operations
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (failCount === 0 && successCount > 0) {
        toast.success(`${successCount} élément(s) synchronisé(s) avec succès`);
      } else if (failCount > 0) {
        toast.warning(`Synchronisation terminée avec ${failCount} erreur(s)`, {
          description: `${successCount} élément(s) synchronisé(s), ${failCount} échec(s)`
        });
      } else {
        toast.info("Aucun élément à synchroniser");
      }
      
      setLastSyncTime(new Date());
      
      // Update the sync count
      const count = await OfflineSyncService.getPendingSyncCount();
      setPendingSyncCount(count);
      
      return results;
    } catch (error: any) {
      console.error('Error during synchronization:', error);
      
      toast.error("Erreur de synchronisation", {
        description: `Une erreur est survenue: ${error.message || error}`
      });
      
      return [{
        success: false,
        message: `Sync error: ${error.message || error}`,
        error
      }];
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);
  
  // Auto-sync when coming back online
  useEffect(() => {
    let syncTimeout: number;
    
    if (isOnline && pendingSyncCount > 0 && !isSyncing) {
      // Delay sync by 2 seconds when first coming online to ensure connection is stable
      syncTimeout = window.setTimeout(() => {
        syncNow();
      }, 2000);
    }
    
    return () => {
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
    };
  }, [isOnline, pendingSyncCount, isSyncing, syncNow]);
  
  // Initialize IndexedDB on mount
  useEffect(() => {
    const initializeDB = async () => {
      try {
        await IndexedDBService.openDB();
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
      }
    };
    
    initializeDB();
  }, []);
  
  // Show toast when network status changes
  useEffect(() => {
    const handleNetworkChange = (online: boolean) => {
      if (online) {
        toast.success("Connecté au réseau", {
          icon: <Cloud className="h-4 w-4 text-green-500" />
        });
      } else {
        toast.warning("Mode hors-ligne activé", {
          description: "Les modifications seront synchronisées dès que possible",
          icon: <CloudOff className="h-4 w-4 text-orange-500" />
        });
      }
    };
    
    // We use a ref to track previous state to avoid showing toast on first mount
    const isFirstMount = React.useRef(true);
    
    if (!isFirstMount.current) {
      handleNetworkChange(isOnline);
    } else {
      isFirstMount.current = false;
    }
  }, [isOnline]);
  
  const value = {
    isOnline,
    isSyncing,
    pendingSyncCount,
    lastSyncTime,
    syncNow,
    addToSyncQueue
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
      
      {showOfflineIndicator && (
        <div className="fixed top-0 right-0 p-2 m-4 z-50">
          <OfflineSyncIndicator showSyncButton={pendingSyncCount > 0} />
        </div>
      )}
      
      {pendingSyncCount > 0 && !isOnline && (
        <div className="fixed bottom-4 right-4 max-w-md z-40">
          <OfflineSyncIndicator showSyncButton={false} />
        </div>
      )}
    </OfflineContext.Provider>
  );
};
