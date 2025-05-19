
import React from 'react';
import { useNetworkState } from '@/hooks/useNetworkState';
import { CloudOff, Cloud, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TranslatedText } from '@/components/i18n/TranslatedText';

interface OfflineSyncIndicatorProps {
  pendingItems?: number;
  isSyncing?: boolean;
  onManualSync?: () => void;
}

export function OfflineSyncIndicator({ 
  pendingItems = 0,
  isSyncing = false,
  onManualSync
}: OfflineSyncIndicatorProps) {
  const isOnline = useNetworkState();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        isOnline 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
      }`}>
        {isOnline ? (
          <Cloud className="h-3.5 w-3.5 mr-1" />
        ) : (
          <CloudOff className="h-3.5 w-3.5 mr-1" />
        )}
        
        {isOnline 
          ? <TranslatedText i18nKey="offline.status.online" defaultText="Connected" />
          : <TranslatedText i18nKey="offline.status.offline" defaultText="Offline" />
        }
      </div>

      {isOnline && pendingItems > 0 && !isSyncing && (
        <button
          onClick={onManualSync}
          className="flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
          title={t('offline.syncNow', 'Sync now')}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          <TranslatedText 
            i18nKey={pendingItems === 1 ? "offline.status.pendingSync" : "offline.status.pluralPendingSync"}
            values={{ count: pendingItems }}
            defaultText={`${pendingItems} pending`}
          />
        </button>
      )}

      {isSyncing && (
        <div className="flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          <TranslatedText i18nKey="offline.status.syncing" defaultText="Syncing..." />
        </div>
      )}
    </div>
  );
}
