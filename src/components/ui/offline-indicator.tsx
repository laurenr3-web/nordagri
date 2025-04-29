
import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useOffline } from '@/providers/OfflineProvider';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const { isOnline, isSyncing, pendingChanges, syncProgress } = useOffline();
  const [visible, setVisible] = useState(false);
  const [animateHide, setAnimateHide] = useState(false);

  useEffect(() => {
    // Show indicator when offline or syncing
    if (!isOnline || isSyncing) {
      setVisible(true);
      setAnimateHide(false);
    } else if (pendingChanges === 0) {
      // If we're online and nothing to sync, animate hiding
      if (visible) {
        setAnimateHide(true);
        const timer = setTimeout(() => {
          setVisible(false);
        }, 1000); // Matches the CSS transition duration
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline, isSyncing, pendingChanges, visible]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-background border shadow-lg flex items-center gap-2 transition-all duration-1000",
        {
          "opacity-0 translate-y-10": animateHide,
          "opacity-100 translate-y-0": !animateHide
        },
        className
      )}
    >
      {isOnline ? (
        <>
          {isSyncing ? (
            <>
              <div className="animate-pulse">
                <Wifi className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">
                Synchronisation {syncProgress.completed}/{syncProgress.total}
              </span>
              {syncProgress.total > 0 && (
                <Progress 
                  value={(syncProgress.completed / syncProgress.total) * 100} 
                  className="w-24 h-1.5"
                />
              )}
            </>
          ) : (
            pendingChanges > 0 && (
              <>
                <Wifi className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {pendingChanges} modification{pendingChanges > 1 ? 's' : ''} en attente
                </span>
              </>
            )
          )}
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium">Mode hors-ligne</span>
          {pendingChanges > 0 && (
            <span className="text-xs text-muted-foreground">
              {pendingChanges} modification{pendingChanges > 1 ? 's' : ''} en attente
            </span>
          )}
        </>
      )}
    </div>
  );
}
