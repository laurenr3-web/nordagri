
import React from 'react';
import { CloudOff, Cloud, CloudSync, CloudLightning } from 'lucide-react';
import { useOfflineStatus } from '@/providers/OfflineProvider';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OfflineSyncIndicatorProps {
  showSyncButton?: boolean;
  className?: string;
}

export function OfflineSyncIndicator({ showSyncButton = false, className }: OfflineSyncIndicatorProps) {
  const { isOnline, isSyncing, pendingSyncCount, syncNow } = useOfflineStatus();
  
  // Determine the status and appropriate icon
  const getStatusDetails = () => {
    if (!isOnline) {
      return {
        icon: <CloudOff className="h-4 w-4" />,
        label: "Hors-ligne",
        tooltip: "Vous êtes actuellement hors-ligne. Les modifications seront synchronisées lors de votre reconnexion.",
        color: "bg-orange-100 text-orange-800 border-orange-200"
      };
    } else if (isSyncing) {
      return {
        icon: <CloudSync className="h-4 w-4 animate-spin" />,
        label: "Synchronisation...",
        tooltip: "Synchronisation en cours...",
        color: "bg-blue-100 text-blue-800 border-blue-200"
      };
    } else if (pendingSyncCount > 0) {
      return {
        icon: <CloudLightning className="h-4 w-4" />,
        label: `${pendingSyncCount} en attente`,
        tooltip: `${pendingSyncCount} modification(s) en attente de synchronisation`,
        color: "bg-amber-100 text-amber-800 border-amber-200"
      };
    } else {
      return {
        icon: <Cloud className="h-4 w-4" />,
        label: "Connecté",
        tooltip: "Toutes les données sont synchronisées",
        color: "bg-green-100 text-green-800 border-green-200"
      };
    }
  };
  
  const { icon, label, tooltip, color } = getStatusDetails();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "py-1 px-2 flex items-center gap-1.5 whitespace-nowrap", 
                color, 
                className
              )}
            >
              {icon}
              <span className="text-xs">{label}</span>
            </Badge>
            
            {showSyncButton && pendingSyncCount > 0 && isOnline && !isSyncing && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-7 px-2 py-1"
                onClick={syncNow}
                disabled={isSyncing}
              >
                Synchroniser
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
