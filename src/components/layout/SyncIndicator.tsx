
import React, { useState } from 'react';
import { useOfflineStatus } from '@/providers/OfflineProvider';
import { Wifi, WifiOff, Cloud, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const SyncIndicator: React.FC = () => {
  const { isOnline, isSyncing, pendingSyncCount, triggerSync } = useOfflineStatus();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const getIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4" />;
    }
    if (isSyncing) {
      return <Cloud className="h-4 w-4 animate-spin" />;
    }
    if (pendingSyncCount > 0) {
      return <Cloud className="h-4 w-4" />;
    }
    return <Wifi className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) {
      return t("network.offlineModeActive");
    }
    if (isSyncing) {
      return t("sync.syncing");
    }
    if (pendingSyncCount > 0) {
      return t("sync.pendingItems");
    }
    return t("network.connected");
  };

  const getStatusColor = () => {
    if (!isOnline) return "text-orange-500";
    if (isSyncing) return "text-blue-500";
    if (pendingSyncCount > 0) return "text-blue-400";
    return "text-green-500";
  };

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`relative ${getStatusColor()} p-1`}
                onClick={() => setOpen(true)}
              >
                {getIcon()}
                {pendingSyncCount > 0 && !isSyncing && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                    {pendingSyncCount > 99 ? '99+' : pendingSyncCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getStatusText()}</p>
          </TooltipContent>
        </Tooltip>

        <PopoverContent className="w-72 p-0" align="end">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 font-medium">
              {getIcon()}
              <span>{getStatusText()}</span>
            </div>
          </div>
          <div className="p-4">
            {!isOnline ? (
              <div className="text-sm text-muted-foreground">
                <p>{t("network.offlineMode")}</p>
              </div>
            ) : pendingSyncCount > 0 ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <p>{t("sync.itemsWillSync", { count: pendingSyncCount })}</p>
                </div>
                <Button 
                  size="sm" 
                  className="w-full"
                  disabled={isSyncing || !isOnline}
                  onClick={() => {
                    triggerSync();
                    setOpen(false);
                  }}
                >
                  {isSyncing ? t("sync.syncing") : t("sync.syncNow")}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("network.connected")}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};
