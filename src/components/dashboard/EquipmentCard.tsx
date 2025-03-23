
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
        "overflow-hidden animate-scale-in rounded-xl border border-border/50", 
        className,
        onClick ? "cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300" : ""
      )}
      style={style}
      onClick={onClick}
    >
      <div className="relative h-48">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute top-4 right-4">
          <div className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium shadow-sm backdrop-blur-sm",
            status === 'operational' ? "bg-agri-100/90 text-agri-800" : 
            status === 'maintenance' ? "bg-harvest-100/90 text-harvest-800" : 
            "bg-destructive/20 text-destructive"
          )}>
            {status === 'operational' ? 'Operational' : 
             status === 'maintenance' ? 'Maintenance' : 
             'Repair Needed'}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-white/80 text-sm">{type}</p>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium">Usage</span>
              <span className="font-semibold">{usage.hours} / {usage.target} hrs</span>
            </div>
            <Progress value={(usage.hours / usage.target) * 100} className="h-2 bg-secondary" />
          </div>
          
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">Next Service:</p>
            <div className="flex justify-between items-center">
              <p className="font-medium">{nextService.type}</p>
              <p className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                nextService.due.includes('Overdue') ? "bg-destructive/10 text-destructive" : 
                nextService.due.includes('days') ? "bg-harvest-100 text-harvest-800" : 
                "bg-agri-100 text-agri-800"
              )}>{nextService.due}</p>
            </div>
          </div>
        </div>
      </div>
    </BlurContainer>
  );
}
