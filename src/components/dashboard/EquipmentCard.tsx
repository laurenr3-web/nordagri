
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface EquipmentCardProps {
  name: string;
  type: string;
  image: string;
  status: 'operational' | 'maintenance' | 'repair';
  usage: {
    hours: number;
    target: number;
  };
  nextService: {
    type: string;
    due: string;
  };
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function EquipmentCard({ name, type, image, status, usage, nextService, className, style, onClick }: EquipmentCardProps) {
  const getStatusClass = (status: 'operational' | 'maintenance' | 'repair') => {
    switch (status) {
      case 'operational':
        return 'status-operational';
      case 'maintenance':
        return 'status-maintenance';
      case 'repair':
        return 'status-repair';
    }
  };

  const getStatusText = (status: 'operational' | 'maintenance' | 'repair') => {
    switch (status) {
      case 'operational':
        return 'Opérationnel';
      case 'maintenance':
        return 'Entretien';
      case 'repair':
        return 'Réparation nécessaire';
      default:
        return status;
    }
  };

  return (
    <div 
      className={cn(
        "overflow-hidden animate-scale-in bg-white rounded-xl border border-border shadow-card card-hover", 
        className,
        onClick ? "cursor-pointer" : ""
      )}
      style={style}
      onClick={onClick}
    >
      <div className="relative h-40 bg-muted">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-contain p-2" 
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
            e.currentTarget.classList.add('bg-muted-foreground/10');
          }}
        />
        <div className="absolute top-3 right-3">
          <div className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            getStatusClass(status)
          )}>
            {getStatusText(status)}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium mb-1 text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{type}</p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span>Utilisation</span>
              <span className="font-medium">{usage.hours} / {usage.target} heures</span>
            </div>
            <Progress 
              value={(usage.hours / usage.target) * 100} 
              className="h-2"
              indicatorClassName={cn(
                (usage.hours / usage.target) > 0.8 ? "bg-alert-red" : 
                (usage.hours / usage.target) > 0.6 ? "bg-alert-orange" : 
                "bg-agri-primary"
              )}
            />
          </div>
          
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">Prochaine maintenance :</p>
            <p className="font-medium">{nextService.type}</p>
            <p className={cn(
              nextService.due.includes('Overdue') ? "text-alert-red font-medium" : 
              nextService.due.includes('days') ? "text-alert-orange" : "text-muted-foreground"
            )}>{nextService.due}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
