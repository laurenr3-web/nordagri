
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNetworkState } from '@/hooks/useNetworkState';
import { syncService } from '@/services/syncService';
import { toast } from 'sonner';

export enum SyncOperationType {
  CREATE = 'add',
  UPDATE = 'update',
  DELETE = 'delete'
}

export interface OfflineContextType {
  isOnline: boolean;
  isInitialized: boolean;
  isSyncing: boolean;
  addToSyncQueue: (operation: string, data: any, entity: string) => Promise<number>;
  syncNow: () => Promise<void>;
  pendingOperationsCount: number;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isInitialized: false,
  isSyncing: false,
  addToSyncQueue: async () => 0,
  syncNow: async () => {},
  pendingOperationsCount: 0
});

export const useOfflineStatus = () => useContext(OfflineContext);

interface OfflineProviderProps {
  children: ReactNode;
  autoSyncInterval?: number;
  showOfflineIndicator?: boolean;
}

export function OfflineProvider({ 
  children, 
  autoSyncInterval = 60000, 
  showOfflineIndicator = true 
}: OfflineProviderProps) {
  const isOnline = useNetworkState();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOperationsCount, setPendingOperationsCount] = useState(0);
  const [syncTimeoutId, setSyncTimeoutId] = useState<number | null>(null);

  // Initialize and check for pending operations
  useEffect(() => {
    const initialize = async () => {
      try {
        const stats = await syncService.getSyncStats();
        setPendingOperationsCount(stats.pending + stats.failed);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing offline provider:', error);
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  // Update pending operations count
  useEffect(() => {
    const updatePendingCount = async () => {
      if (isInitialized) {
        const stats = await syncService.getSyncStats();
        setPendingOperationsCount(stats.pending + stats.failed);
      }
    };

    // Update immediately and then every minute
    updatePendingCount();
    const intervalId = setInterval(updatePendingCount, 60000);
    
    return () => clearInterval(intervalId);
  }, [isInitialized]);

  // Auto sync when coming back online
  useEffect(() => {
    if (isOnline && isInitialized && pendingOperationsCount > 0 && !isSyncing) {
      syncNow();
    }
  }, [isOnline, isInitialized, pendingOperationsCount]);

  // Auto sync on interval
  useEffect(() => {
    if (isOnline && isInitialized && autoSyncInterval > 0) {
      const id = window.setTimeout(async () => {
        if (pendingOperationsCount > 0) {
          await syncNow();
        }
      }, autoSyncInterval);
      
      setSyncTimeoutId(id);
      
      return () => {
        if (syncTimeoutId) {
          clearTimeout(syncTimeoutId);
        }
      };
    }
  }, [isOnline, isInitialized, pendingOperationsCount, autoSyncInterval]);

  // Add an operation to the sync queue
  const addToSyncQueue = async (operation: string, data: any, entity: string): Promise<number> => {
    try {
      let type: 'add' | 'update' | 'delete';
      
      switch (operation) {
        case 'add':
        case 'create':
          type = 'add';
          break;
        case 'update':
        case 'edit':
          type = 'update';
          break;
        case 'delete':
        case 'remove':
          type = 'delete';
          break;
        default:
          type = 'update';
      }
      
      const id = await syncService.addToSyncQueue(type, data, entity);
      
      // Update pending operations count
      const stats = await syncService.getSyncStats();
      setPendingOperationsCount(stats.pending + stats.failed);
      
      return id;
    } catch (error) {
      console.error('Error adding operation to sync queue:', error);
      throw error;
    }
  };

  // Sync now
  const syncNow = async (): Promise<void> => {
    if (isSyncing || !isOnline) return;
    
    try {
      setIsSyncing(true);
      
      // Get all pending operations
      const operations = await syncService.getPendingOperations();
      
      if (operations.length === 0) {
        setIsSyncing(false);
        return;
      }
      
      // Process operations
      const results = await syncService.sync();
      
      // Update pending operations count
      const stats = await syncService.getSyncStats();
      setPendingOperationsCount(stats.pending + stats.failed);
      
      // Show success toast
      const successCount = results.filter(r => r.success).length;
      
      if (successCount > 0) {
        toast.success(`Synchronisation terminée`, {
          description: `${successCount} opération(s) synchronisée(s)`
        });
      }
    } catch (error) {
      console.error('Error performing sync:', error);
      toast.error('Erreur lors de la synchronisation', {
        description: 'Veuillez réessayer plus tard'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const value: OfflineContextType = {
    isOnline,
    isInitialized,
    isSyncing,
    addToSyncQueue,
    syncNow,
    pendingOperationsCount
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
      {showOfflineIndicator && !isOnline && (
        <div className="fixed bottom-16 left-0 right-0 bg-red-500 text-white text-center py-1 text-sm">
          Mode hors ligne
        </div>
      )}
      {showOfflineIndicator && isOnline && pendingOperationsCount > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-yellow-500 text-white text-center py-1 text-sm">
          {isSyncing ? 
            `Synchronisation en cours (${pendingOperationsCount})...` : 
            `${pendingOperationsCount} opération(s) en attente`
          }
        </div>
      )}
    </OfflineContext.Provider>
  );
}
