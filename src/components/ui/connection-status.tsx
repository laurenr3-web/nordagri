
import React from 'react';
import { useRealtimeCache } from '@/providers/RealtimeCacheProvider';
import { Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const { isOfflineMode, toggleOfflineMode, prefetchCriticalData } = useRealtimeCache();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "relative transition-all",
              isOfflineMode ? "text-amber-500" : "text-green-500",
              className
            )}
            onClick={toggleOfflineMode}
          >
            {isOfflineMode ? (
              <WifiOff className="h-5 w-5" />
            ) : (
              <Wifi className="h-5 w-5" />
            )}
            {isOfflineMode && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {isOfflineMode
              ? "Mode hors ligne actif. Cliquez pour vous reconnecter."
              : "Connecté. Cliquez pour passer en mode hors ligne."}
          </p>
          {!isOfflineMode && (
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-xs text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                prefetchCriticalData();
              }}
            >
              Précharger les données pour le mode hors ligne
            </Button>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
