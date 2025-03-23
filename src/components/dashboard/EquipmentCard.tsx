
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
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
  return (
    <BlurContainer 
      className={cn(
        "overflow-hidden animate-scale-in", 
        className,
        onClick ? "cursor-pointer" : ""
      )}
      style={style}
      onClick={onClick}
    >
      <div className="relative h-40">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2">
          <div className={cn(
            "px-2 py-1 rounded-md text-xs font-medium",
            status === 'operational' ? "bg-agri-100 text-agri-800" : 
            status === 'maintenance' ? "bg-harvest-100 text-harvest-800" : 
            "bg-destructive/20 text-destructive"
          )}>
            {status === 'operational' ? 'Operational' : 
             status === 'maintenance' ? 'Maintenance' : 
             'Repair Needed'}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{type}</p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Usage</span>
              <span className="font-medium">{usage.hours} / {usage.target} hrs</span>
            </div>
            <Progress value={(usage.hours / usage.target) * 100} />
          </div>
          
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">Next Service:</p>
            <p className="font-medium">{nextService.type}</p>
            <p className={cn(
              nextService.due.includes('Overdue') ? "text-destructive" : 
              nextService.due.includes('days') ? "text-harvest-600" : ""
            )}>{nextService.due}</p>
          </div>
        </div>
      </div>
    </BlurContainer>
  );
}
