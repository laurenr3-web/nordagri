
import React from 'react';
import { useOfflineStatus } from '@/providers/OfflineProvider';
import { CloudOff, Cloud, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NetworkStatusProps {
  className?: string;
  showLabel?: boolean;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  className,
  showLabel = true
}) => {
  const { isOnline, isSyncing, pendingSyncCount, syncNow } = useOfflineStatus();
  
  // Function to handle click on the network status indicator
  const handleClick = () => {
    if (isOnline && pendingSyncCount > 0 && !isSyncing) {
      syncNow();
    }
  };
  
  // If online with no pending syncs, no need to show anything
  if (isOnline && pendingSyncCount === 0 && !isSyncing) {
    return null;
  }
  
  return (
    <Badge
      variant={isOnline ? "outline" : "destructive"}
      className={cn(
        "inline-flex items-center gap-1 cursor-pointer", 
        isSyncing && "animate-pulse",
        pendingSyncCount > 0 && isOnline && "hover:bg-blue-100 hover:text-blue-800 border-blue-200",
        className
      )}
      onClick={handleClick}
    >
      {!isOnline && <CloudOff className="h-3 w-3" />}
      {isOnline && isSyncing && <Cloud className="h-3 w-3 animate-spin" />}
      {isOnline && !isSyncing && pendingSyncCount > 0 && <Database className="h-3 w-3" />}
      
      {showLabel && (
        <span className="text-xs font-medium">
          {!isOnline && "Hors-ligne"}
          {isOnline && isSyncing && "Synchronisation..."}
          {isOnline && !isSyncing && pendingSyncCount > 0 && `${pendingSyncCount} en attente`}
        </span>
      )}
    </Badge>
  );
};
