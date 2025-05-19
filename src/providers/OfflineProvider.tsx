
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNetworkState } from '@/hooks/useNetworkState';

// Define the operation types for synchronization
export enum SyncOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  BATCH = 'batch'
}

// Define the context type
interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: number;
  lastSyncTime: Date | null;
  syncErrors: Error[];
  triggerSync: () => Promise<void>;
}

// Create context with default values
const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isSyncing: false,
  pendingOperations: 0,
  lastSyncTime: null,
  syncErrors: [],
  triggerSync: async () => {}
});

// Hook to use the offline context
export const useOfflineStatus = () => useContext(OfflineContext);

interface OfflineProviderProps {
  children: ReactNode;
  syncService?: any; // Ideally you would type this properly
  autoSyncInterval?: number; // Minutes between auto sync attempts
  showOfflineIndicator?: boolean;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ 
  children, 
  syncService,
  autoSyncInterval = 5,
  showOfflineIndicator = true
}) => {
  const isOnline = useNetworkState();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncErrors, setSyncErrors] = useState<Error[]>([]);

  // Fetch pending operations count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        if (syncService) {
          const count = await syncService.getPendingOperationsCount();
          setPendingOperations(count);
        }
      } catch (error) {
        console.error('Failed to fetch pending operations count:', error);
      }
    };

    fetchPendingCount();
    // Set up an interval to periodically check for pending operations
    const interval = setInterval(fetchPendingCount, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [syncService]);
  
  // Auto-sync periodically based on interval
  useEffect(() => {
    if (!isOnline || !syncService) return;
    
    const autoSync = async () => {
      if (pendingOperations > 0 && !isSyncing) {
        await triggerSync();
      }
    };
    
    const interval = setInterval(autoSync, autoSyncInterval * 60 * 1000); // Convert minutes to ms
    
    return () => clearInterval(interval);
  }, [isOnline, pendingOperations, isSyncing, autoSyncInterval, syncService]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingOperations > 0 && !isSyncing) {
      triggerSync();
    }
  }, [isOnline, pendingOperations, isSyncing]);

  // Trigger manual sync
  const triggerSync = async () => {
    if (!isOnline || !syncService || isSyncing) return;
    
    setIsSyncing(true);
    setSyncErrors([]);
    
    try {
      await syncService.syncPendingOperations();
      setLastSyncTime(new Date());
      // Refresh count after sync
      const count = await syncService.getPendingOperationsCount();
      setPendingOperations(count);
    } catch (error) {
      console.error('Sync failed:', error);
      if (error instanceof Error) {
        setSyncErrors(prev => [...prev, error]);
      } else {
        setSyncErrors(prev => [...prev, new Error('Unknown sync error')]);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const contextValue: OfflineContextType = {
    isOnline,
    isSyncing,
    pendingOperations,
    lastSyncTime,
    syncErrors,
    triggerSync
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
};
