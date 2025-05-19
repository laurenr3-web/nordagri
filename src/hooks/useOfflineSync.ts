
import { useState, useEffect } from 'react';
import { useNetworkState } from './useNetworkState';
import { SyncOperationType } from '@/providers/OfflineProvider';
import { IndexedDBService } from '@/services/offline/indexedDBService';
import { OfflineSyncService } from '@/services/offline/offlineSyncService';

// Singleton instances for services
let indexedDBService: IndexedDBService | null = null;
let offlineSyncService: OfflineSyncService | null = null;

// Initialize services
const getServices = () => {
  if (!indexedDBService) {
    indexedDBService = new IndexedDBService('nordagri-db', 1);
  }
  
  if (!offlineSyncService && indexedDBService) {
    offlineSyncService = new OfflineSyncService(indexedDBService);
  }
  
  return { indexedDBService, offlineSyncService };
};

// Hook for managing offline synchronization
export const useOfflineSync = () => {
  const isOnline = useNetworkState();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  const { offlineSyncService } = getServices();
  
  // Load initial pending count
  useEffect(() => {
    const loadPendingCount = async () => {
      if (offlineSyncService) {
        const count = await offlineSyncService.getPendingOperationsCount();
        setPendingCount(count);
      }
    };
    
    loadPendingCount();
    
    // Set up periodic check
    const interval = setInterval(loadPendingCount, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Auto sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      syncPendingOperations();
    }
  }, [isOnline, pendingCount, isSyncing]);
  
  // Queue an operation for sync
  const queueOperation = async (
    type: SyncOperationType,
    entity: string,
    data: any,
    priority: number = 5
  ) => {
    if (!offlineSyncService) return null;
    
    const operationId = await offlineSyncService.queueOperation(
      type,
      entity,
      data,
      priority
    );
    
    // Update pending count
    const newCount = await offlineSyncService.getPendingOperationsCount();
    setPendingCount(newCount);
    
    return operationId;
  };
  
  // Sync all pending operations
  const syncPendingOperations = async () => {
    if (!offlineSyncService || !isOnline || isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      const result = await offlineSyncService.processQueue();
      setLastSyncTime(new Date());
      
      // Update pending count
      const newCount = await offlineSyncService.getPendingOperationsCount();
      setPendingCount(newCount);
      
      return result;
    } finally {
      setIsSyncing(false);
    }
  };
  
  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncTime,
    queueOperation,
    syncPendingOperations
  };
};
