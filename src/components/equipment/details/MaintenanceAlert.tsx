
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface MaintenanceAlertProps {
  equipment: any;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const MaintenanceAlert: React.FC<MaintenanceAlertProps> = ({ 
  equipment, 
  size = 'md', 
  showLabel = false,
  className
}) => {
  // On vérifie si l'équipement a une maintenance en retard
  const hasOverdueMaintenance = React.useMemo(() => {
    if (!equipment) return false;
    
    // Si l'équipement a une date de maintenance prévue et qu'elle est passée
    if (equipment.nextService && new Date(equipment.nextService.due) < new Date()) {
      return true;
    }
    
    // Si l'équipement a dépassé ses heures d'utilisation prévues
    if (
      equipment.usage && 
      equipment.usage.target && 
      equipment.usage.hours >= equipment.usage.target
    ) {
      return true;
    }
    
    return false;
  }, [equipment]);
  
  if (!hasOverdueMaintenance) return null;

  // Déterminer la taille de l'icône en fonction de la prop size
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
  
  const maintenanceInfo = equipment.nextService
    ? `Maintenance ${equipment.nextService.type} en retard`
    : "Maintenance requise";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1.5", className)}>
            <AlertCircle className={cn(iconSize, "text-red-500")} />
            {showLabel && (
              <Badge variant="destructive" className="px-2 py-0 text-xs">
                Maintenance requise
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{maintenanceInfo}</p>
          {equipment.nextService && (
            <p className="text-xs text-muted-foreground">
              Prévue le {new Date(equipment.nextService.due).toLocaleDateString()}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MaintenanceAlert;
