
import React, { useState } from 'react';
import { useSyncStatus } from '@/hooks/useOfflineQuery';
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudOff, Loader, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SyncIndicatorProps {
  className?: string;
  showLabel?: boolean;
  showButton?: boolean;
  variant?: 'default' | 'minimal';
}

export function SyncIndicator({
  className,
  showLabel = true,
  showButton = true,
  variant = 'default'
}: SyncIndicatorProps) {
  const { isOnline, isSyncing, pendingSyncCount, syncNow } = useSyncStatus();
  const [isSyncing2, setIsSyncing2] = useState(false);

  // Fonction pour déclencher manuellement une synchronisation
  const handleSync = async () => {
    if (!isOnline) {
      toast.error("Synchronisation impossible", {
        description: "Vous êtes actuellement hors ligne"
      });
      return;
    }

    if (isSyncing || isSyncing2) {
      toast.info("Synchronisation déjà en cours");
      return;
    }

    try {
      setIsSyncing2(true);
      const results = await syncNow();
      
      // Compter les succès et les échecs
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (results.length === 0) {
        toast.info("Aucun élément à synchroniser");
      } else if (failCount === 0) {
        toast.success(`${successCount} élément(s) synchronisé(s)`);
      } else {
        toast.warning(`Synchronisation partielle`, {
          description: `${successCount} réussi(s), ${failCount} échec(s)`
        });
      }
    } catch (error) {
      toast.error("Erreur de synchronisation", {
        description: error.message
      });
    } finally {
      setIsSyncing2(false);
    }
  };

  // Si tout est synchronisé et en ligne, on peut afficher une version minimale
  if (variant === 'minimal' && isOnline && pendingSyncCount === 0 && !isSyncing && !isSyncing2) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Indicateur d'état */}
      <Badge 
        variant={!isOnline ? "destructive" : (pendingSyncCount > 0 ? "outline" : "secondary")}
        className={cn(
          "flex items-center gap-1", 
          (isSyncing || isSyncing2) && "animate-pulse",
          !showLabel && "px-1.5"
        )}
      >
        {!isOnline && <CloudOff className="h-3 w-3" />}
        {isOnline && (isSyncing || isSyncing2) && <Loader className="h-3 w-3 animate-spin" />}
        {isOnline && !(isSyncing || isSyncing2) && <Cloud className="h-3 w-3" />}
        
        {showLabel && (
          <span className="text-xs">
            {!isOnline && "Hors ligne"}
            {isOnline && (isSyncing || isSyncing2) && "Synchronisation..."}
            {isOnline && !(isSyncing || isSyncing2) && pendingSyncCount > 0 && 
              `${pendingSyncCount} en attente`}
            {isOnline && !(isSyncing || isSyncing2) && pendingSyncCount === 0 && "Synchronisé"}
          </span>
        )}
      </Badge>

      {/* Bouton de synchronisation manuelle */}
      {showButton && pendingSyncCount > 0 && isOnline && !(isSyncing || isSyncing2) && (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={handleSync}
              disabled={isSyncing || isSyncing2}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="sr-only">Synchroniser</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Synchroniser {pendingSyncCount} élément(s) en attente</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
