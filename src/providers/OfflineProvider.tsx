import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { useNetworkState } from '@/hooks/useNetworkState';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

interface OfflineContextProps {
  isOffline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  syncNow: () => void;
  lastSync: Date | null;
}

const OfflineContext = createContext<OfflineContextProps>({
  isOffline: false,
  pendingSyncCount: 0,
  isSyncing: false,
  syncNow: () => {},
  lastSync: null,
});

interface OfflineProviderProps {
  children: React.ReactNode;
  autoSyncInterval?: number;
  showOfflineIndicator?: boolean;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({
  children,
  autoSyncInterval = 60000, // Default to 60 seconds
  showOfflineIndicator = true,
}) => {
  const isOnline = useNetworkState();
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Mock localStorage, replace with your actual persistence mechanism
  const [offlineData, setOfflineData] = useState<any[]>([]);

  // Load initial data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem('offlineData');
    if (storedData) {
      setOfflineData(JSON.parse(storedData));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('offlineData', JSON.stringify(offlineData));
    setPendingSyncCount(offlineData.length);
  }, [offlineData]);

  // Function to schedule a sync operation
  const scheduleSyncOperation = (
    entity: string,
    entityId: string | number,
    operationType: 'create' | 'update' | 'delete',
    payload: any
  ) => {
    setOfflineData((prevData) => [
      ...prevData,
      {
        entity,
        entityId,
        operationType,
        payload,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // Function to execute sync operations
  const executeSyncOperations = useCallback(async () => {
    if (!isOnline || isSyncing || offlineData.length === 0) {
      return;
    }

    setIsSyncing(true);
    let successCount = 0;
    let failCount = 0;

    for (const operation of offlineData) {
      try {
        // Simulate API call based on operation type
        console.log(
          `Simulating API call: ${operation.operationType} ${operation.entity} ${operation.entityId}`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network latency
        successCount++;
      } catch (error: any) {
        const errorId = error && typeof error === 'object' && 'id' in error ? error.id : 'unknown';
        console.error(`Sync error for operation ${errorId}:`, error);
        failCount++;
      } finally {
        // Remove the operation from the queue
        setOfflineData((prevData) =>
          prevData.filter((item) => item !== operation)
        );
      }
    }

    setIsSyncing(false);
    setLastSync(new Date());

    if (failCount === 0) {
      toast({
        title: t('offline.syncSuccess', { count: successCount }),
        description: t('offline.syncSuccess', { count: successCount }),
      });
    } else {
      toast({
        title: t('offline.syncPartial', { failCount }),
        description: t('offline.syncPartial', { failCount }),
      });
    }
  }, [isOnline, isSyncing, offlineData, toast, t]);

  // Auto-sync effect
  useEffect(() => {
    if (autoSyncInterval <= 0) {
      return;
    }

    let intervalId: NodeJS.Timeout;

    if (isOnline) {
      intervalId = setInterval(executeSyncOperations, autoSyncInterval);
    }

    return () => clearInterval(intervalId);
  }, [isOnline, autoSyncInterval, executeSyncOperations]);

  // Initial sync and online status sync
  useEffect(() => {
    if (isOnline) {
      executeSyncOperations();
    } else {
      toast({
        title: t('offline.offlineMode'),
        description: t('offline.pendingChanges'),
      });
    }
  }, [isOnline, toast, t, executeSyncOperations]);

  const contextValue: OfflineContextProps = {
    isOffline: !isOnline,
    pendingSyncCount,
    isSyncing,
    syncNow: executeSyncOperations,
    lastSync,
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => useContext(OfflineContext);
