
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { OfflineSyncService, SyncQueueItem } from '@/services/offline/offlineSyncService';
import { useNetworkState } from '@/hooks/useNetworkState';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
  lastSyncTime: Date | null;
  syncProgress: {
    total: number;
    completed: number;
  };
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const isOnline = useNetworkState();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncProgress, setSyncProgress] = useState({ total: 0, completed: 0 });

  // Check for pending changes when component mounts and network status changes
  useEffect(() => {
    const checkPendingChanges = () => {
      const queue = OfflineSyncService.getSyncQueue();
      setPendingChanges(queue.length);
    };

    // Initial check
    checkPendingChanges();

    // Subscribe to changes in the sync queue
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nordagri_sync_queue') {
        checkPendingChanges();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Synchronize when coming back online
  useEffect(() => {
    if (isOnline && pendingChanges > 0 && !isSyncing) {
      synchronizeData();
    }
  }, [isOnline, pendingChanges, isSyncing]);

  // Synchronize data with the backend
  const synchronizeData = async () => {
    if (!isOnline || pendingChanges === 0) return;

    setIsSyncing(true);
    const queue = OfflineSyncService.getSyncQueue();
    setSyncProgress({ total: queue.length, completed: 0 });

    toast.info(`Synchronisation en cours (${queue.length} élément${queue.length > 1 ? 's' : ''})...`);

    try {
      let completedItems = 0;
      for (const item of queue) {
        try {
          // Process the item based on its type
          await processQueueItem(item);
          // Remove the item from the queue on successful sync
          OfflineSyncService.removeFromSyncQueue(item.id);
          completedItems++;
          setSyncProgress({ total: queue.length, completed: completedItems });
        } catch (error) {
          console.error(`Erreur lors de la synchronisation de l'élément ${item.id}:`, error);
          // Don't remove failed items, they will be retried next time
        }
      }

      setLastSyncTime(new Date());
      toast.success('Synchronisation terminée avec succès');
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setIsSyncing(false);
      // Update pending changes count
      setPendingChanges(OfflineSyncService.getSyncQueue().length);
    }
  };

  // Process a queue item based on its type
  const processQueueItem = async (item: SyncQueueItem) => {
    switch (item.type) {
      case 'add_part':
        return await import('@/services/supabase/parts/addPart').then(module => 
          module.addPart(item.data)
        );
      case 'update_part':
        return await import('@/services/supabase/parts/updatePart').then(module => 
          module.updatePart(item.data)
        );
      case 'delete_part':
        return await import('@/services/supabase/parts/deletePart').then(module => 
          module.deletePart(item.data.id)
        );
      // Add more cases for other entity types
      default:
        throw new Error(`Type d'élément inconnu: ${item.type}`);
    }
  };

  const value: OfflineContextType = {
    isOnline,
    isSyncing,
    pendingChanges,
    lastSyncTime,
    syncProgress
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}
