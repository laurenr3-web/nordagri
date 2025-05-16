
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useNetworkState } from '@/hooks/useNetworkState';
import { 
  useOfflineSyncManager, 
  OfflineSyncService, 
  SyncStats 
} from '@/services/offline/offlineSyncService';
import { Wifi, WifiOff, Cloud, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  syncStats: SyncStats;
  triggerSync: () => Promise<void>;
  addToSyncQueue: typeof OfflineSyncService.addToSyncQueue;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isSyncing: false,
  pendingSyncCount: 0,
  syncStats: { total: 0, pending: 0, success: 0, error: 0, conflict: 0 },
  triggerSync: async () => {},
  addToSyncQueue: OfflineSyncService.addToSyncQueue
});

export const useOfflineStatus = () => useContext(OfflineContext);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const isOnline = useNetworkState();
  const { isSyncing, syncCount, syncStats, syncPendingItems } = useOfflineSyncManager();
  const [showBanner, setShowBanner] = useState(false);
  const { t } = useTranslation();
  
  // Gérer l'affichage de la bannière, avec un délai pour éviter des flashs
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!isOnline) {
      timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
    } else {
      setShowBanner(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOnline]);

  // Afficher une notification lorsque l'état de connexion change
  useEffect(() => {
    if (isOnline) {
      toast.success(t("network.connected"));
      
      if (syncCount > 0) {
        toast(t("sync.pendingItems"), {
          description: t("sync.itemsWillSync", { count: syncCount }),
          action: {
            label: t("sync.syncNow"),
            onClick: () => syncPendingItems()
          }
        });
      }
    } else {
      toast.warning(t("network.offline"), {
        description: t("network.offlineMode")
      });
    }
  }, [isOnline, syncCount, t]);

  // Gérer le déclenchement manuel de la synchronisation
  const triggerSync = async () => {
    if (isOnline) {
      await syncPendingItems();
    } else {
      toast.error(t("sync.cannotSyncOffline"));
    }
  };

  const value = {
    isOnline,
    isSyncing,
    pendingSyncCount: syncCount,
    syncStats,
    triggerSync,
    addToSyncQueue: OfflineSyncService.addToSyncQueue
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
      
      {/* Bannière mode hors-ligne persistante */}
      {showBanner && (
        <div className="fixed top-0 right-0 p-2 m-4 bg-orange-100 text-orange-800 rounded-md shadow-md z-50 flex items-center gap-2 animate-fade-in">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">{t("network.offlineModeActive")}</span>
        </div>
      )}
      
      {/* Statut de synchronisation */}
      {isSyncing && (
        <div className="fixed top-0 right-0 p-2 m-4 bg-blue-100 text-blue-800 rounded-md shadow-md z-50 flex items-center gap-2 animate-fade-in">
          <Cloud className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">
            {t("sync.syncing")}...
            {syncStats.success > 0 && ` (${syncStats.success}/${syncStats.total})`}
          </span>
        </div>
      )}
      
      {/* Bannière éléments en attente (quand en ligne) */}
      {isOnline && !isSyncing && syncCount > 0 && (
        <div className="fixed bottom-0 right-0 p-2 m-4 bg-blue-50 text-blue-800 rounded-md shadow-md z-50 flex flex-col gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            <span className="text-sm font-medium">
              {t("sync.pendingItems")}: {syncCount}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs bg-white"
            onClick={triggerSync}
          >
            {t("sync.syncNow")}
          </Button>
        </div>
      )}
      
      {/* Bannière pour les conflits */}
      {syncStats.conflict > 0 && (
        <div className="fixed bottom-0 left-0 p-2 m-4 bg-yellow-50 text-yellow-800 rounded-md shadow-md z-50 flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {t("sync.conflictsDetected")}: {syncStats.conflict}
          </span>
        </div>
      )}
    </OfflineContext.Provider>
  );
};
