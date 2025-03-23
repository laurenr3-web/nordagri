
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  style?: React.CSSProperties;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  description, 
  trend, 
  className,
  style
}: StatsCardProps) {
  return (
    <BlurContainer 
      className={cn("p-6 animate-fade-in", className)}
      intensity="light"
      raised
      style={style}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-semibold tracking-tight mb-1">{value}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-agri-600" : "text-destructive"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last season</span>
            </div>
          )}
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </BlurContainer>
  );
}
