
import React, { createContext, useContext, useState, useEffect } from 'react';
import { OfflineSyncService, SyncProgress } from '@/services/offline/offlineSyncService';
import { useNetworkState } from '@/hooks/useNetworkState';

// Context interface
interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
  syncProgress: SyncProgress;
  startSync: () => Promise<void>;
  getOfflineCache: <T>(key: string) => T | null;
  saveOfflineCache: <T>(key: string, data: T, expirationMinutes?: number) => void;
}

// Default context values
const defaultContext: OfflineContextType = {
  isOnline: true,
  isSyncing: false,
  pendingChanges: 0,
  syncProgress: { total: 0, completed: 0, failed: 0 },
  startSync: async () => {},
  getOfflineCache: () => null,
  saveOfflineCache: () => {},
};

// Create context
const OfflineContext = createContext<OfflineContextType>(defaultContext);

// Use offline hook
export const useOffline = () => useContext(OfflineContext);

interface OfflineProviderProps {
  children: React.ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const isOnline = useNetworkState();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({ total: 0, completed: 0, failed: 0 });

  // Update pending changes count
  useEffect(() => {
    const updatePendingCount = () => {
      const pendingItems = OfflineSyncService.getPendingItems();
      setPendingChanges(pendingItems.length);
    };

    // Initial update
    updatePendingCount();

    // Set interval to periodically check for changes
    const intervalId = setInterval(updatePendingCount, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Handle coming back online
  useEffect(() => {
    if (isOnline && pendingChanges > 0) {
      // Small delay to ensure network is actually stable
      const timerId = setTimeout(() => {
        startSync();
      }, 2000);
      
      return () => clearTimeout(timerId);
    }
  }, [isOnline, pendingChanges]);

  // Sync function
  const startSync = async () => {
    if (!isOnline || isSyncing || pendingChanges === 0) return;

    setIsSyncing(true);
    const pendingItems = OfflineSyncService.getPendingItems();
    
    setSyncProgress({
      total: pendingItems.length,
      completed: 0,
      failed: 0,
    });

    try {
      // This is just a placeholder. In a real implementation,
      // we would process each item based on its type.
      // For example: if item.type === 'add_equipment', call equipmentService.addEquipment(item.data)
      
      for (const item of pendingItems) {
        try {
          // Simulate processing time for demo purposes
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mark as processed
          OfflineSyncService.markAsProcessed(item.id);
          
          setSyncProgress(prev => ({
            ...prev,
            completed: prev.completed + 1,
          }));
        } catch (error) {
          console.error(`Error processing offline item ${item.id}:`, error);
          
          // Only count as failed after multiple retries
          if (item.retries >= 2) {
            OfflineSyncService.markAsProcessed(item.id, String(error));
            
            setSyncProgress(prev => ({
              ...prev,
              failed: prev.failed + 1,
            }));
          }
        }
      }
    } finally {
      // Update pending count again after sync attempt
      const remainingPending = OfflineSyncService.getPendingItems();
      setPendingChanges(remainingPending.length);
      setIsSyncing(false);
    }
  };

  const getOfflineCache = <T,>(key: string): T | null => {
    return OfflineSyncService.getCachedData<T>(key);
  };

  const saveOfflineCache = <T,>(key: string, data: T, expirationMinutes = 60) => {
    OfflineSyncService.cacheData(key, data, expirationMinutes);
  };

  // Context value
  const value: OfflineContextType = {
    isOnline,
    isSyncing,
    pendingChanges,
    syncProgress,
    startSync,
    getOfflineCache,
    saveOfflineCache,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};
