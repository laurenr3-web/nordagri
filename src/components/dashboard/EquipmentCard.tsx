
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Clock, AlertTriangle } from 'lucide-react';

interface EquipmentCardProps {
  name: string;
  type: string;
  image: string;
  status: 'operational' | 'maintenance' | 'repair';
  usage: {
    hours: number;
    target: number;
  };
  nextService?: {
    type: string;
    due: string;
  };
  className?: string;
  style?: React.CSSProperties;
}

export function EquipmentCard({
  name,
  type,
  image,
  status,
  usage,
  nextService,
  className,
  style
}: EquipmentCardProps) {
  const statusColors = {
    operational: "bg-agri-100 text-agri-800",
    maintenance: "bg-harvest-100 text-harvest-800",
    repair: "bg-destructive/20 text-destructive"
  };

  const statusText = {
    operational: "Operational",
    maintenance: "Scheduled Maintenance",
    repair: "Needs Repair"
  };

  const usagePercentage = Math.round((usage.hours / usage.target) * 100);
  
  return (
    <BlurContainer
      className={cn("overflow-hidden group animate-scale-in", className)}
      raised
      style={style}
    >
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            statusColors[status]
          )}>
            {statusText[status]}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-muted-foreground">{type}</p>
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Usage</span>
              <span className="font-medium">{usage.hours} / {usage.target} hrs</span>
            </div>
            <Progress value={usagePercentage} className="h-1.5" />
          </div>
          
          {nextService && (
            <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
              <div className="flex items-center">
                <Clock size={14} className="mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">Next Service:</span>
              </div>
              <div className="flex items-center">
                <span>{nextService.type}</span>
                <span className="text-muted-foreground ml-1">({nextService.due})</span>
                {status === 'maintenance' && (
                  <AlertTriangle size={14} className="ml-1 text-harvest-500" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </BlurContainer>
  );
}
