
import { useState, useEffect, useCallback } from 'react';
import { OfflineSyncService, SyncResult } from '@/services/offline/offlineSyncService';
import { SyncOperationType } from '@/providers/OfflineProvider';
import { useNetworkState } from './useNetworkState';
import { toast } from 'sonner';

export interface OfflineSyncState {
  isSyncing: boolean;
  syncCount: number;
  lastSyncTime: Date | null;
  lastSyncResults: SyncResult[];
  addToSyncQueue: (type: SyncOperationType, data: any, tableName: string) => Promise<string>;
  syncNow: () => Promise<SyncResult[]>;
}

export function useOfflineSync(
  syncOnReconnect = true,
  notifyOnSync = true
): OfflineSyncState {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncCount, setSyncCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [lastSyncResults, setLastSyncResults] = useState<SyncResult[]>([]);
  const isOnline = useNetworkState();
  
  // Load the initial sync count on mount
  useEffect(() => {
    const loadSyncCount = async () => {
      const count = await OfflineSyncService.getPendingSyncCount();
      setSyncCount(count);
    };
    
    loadSyncCount();
    
    // Set up interval to periodically check sync count
    const interval = setInterval(loadSyncCount, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Function to add an item to the sync queue
  const addToSyncQueue = useCallback(
    async (type: SyncOperationType, data: any, tableName: string): Promise<string> => {
      const id = await OfflineSyncService.addToSyncQueue(type, data, tableName);
      
      // Update the sync count
      const count = await OfflineSyncService.getPendingSyncCount();
      setSyncCount(count);
      
      return id;
    },
    []
  );
  
  // Function to manually trigger synchronization
  const syncNow = useCallback(async (): Promise<SyncResult[]> => {
    if (!isOnline) {
      if (notifyOnSync) {
        toast.warning("Synchronisation impossible", {
          description: "Vous êtes hors connexion. Réessayez quand vous serez connecté."
        });
      }
      return [];
    }
    
    if (isSyncing) {
      if (notifyOnSync) {
        toast.info("Synchronisation déjà en cours...");
      }
      return [];
    }
    
    try {
      setIsSyncing(true);
      
      if (notifyOnSync) {
        toast.loading("Synchronisation en cours...");
      }
      
      const results = await OfflineSyncService.processSyncQueue(
        (current, total) => {
          if (notifyOnSync) {
            toast.loading(`Synchronisation en cours... (${current}/${total})`);
          }
        },
        (results) => {
          // Count successful and failed operations
          const successCount = results.filter(r => r.success).length;
          const failCount = results.filter(r => !r.success).length;
          
          if (notifyOnSync) {
            if (failCount === 0) {
              toast.success(`${successCount} élément(s) synchronisé(s) avec succès`);
            } else {
              toast.warning(`Synchronisation terminée avec ${failCount} erreur(s)`, {
                description: `${successCount} élément(s) synchronisé(s), ${failCount} échec(s)`
              });
            }
          }
        }
      );
      
      setLastSyncResults(results);
      setLastSyncTime(new Date());
      
      // Update the sync count
      const count = await OfflineSyncService.getPendingSyncCount();
      setSyncCount(count);
      
      return results;
    } catch (error) {
      console.error('Error during synchronization:', error);
      
      if (notifyOnSync) {
        toast.error("Erreur de synchronisation", {
          description: `Une erreur est survenue: ${error.message || error}`
        });
      }
      
      return [{
        success: false,
        message: `Sync error: ${error.message || error}`,
        error
      }];
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, notifyOnSync]);
  
  // Trigger sync when coming back online if configured
  useEffect(() => {
    if (syncOnReconnect && isOnline && syncCount > 0 && !isSyncing) {
      syncNow();
    }
  }, [isOnline, syncCount, isSyncing, syncOnReconnect, syncNow]);
  
  return {
    isSyncing,
    syncCount,
    lastSyncTime,
    lastSyncResults,
    addToSyncQueue,
    syncNow
  };
}
