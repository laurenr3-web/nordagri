
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
  onClick?: () => void;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  description, 
  trend, 
  className,
  style,
  onClick
}: StatsCardProps) {
  return (
    <BlurContainer 
      className={cn("p-6 animate-fade-in rounded-xl border border-border/50 hover:shadow-md transition-all duration-300", className)}
      intensity="light"
      raised
      style={style}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-semibold tracking-tight mb-1">{value}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                trend.isPositive ? "bg-agri-100 text-agri-800" : "bg-destructive/10 text-destructive"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}% vs last season
              </span>
            </div>
          )}
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shadow-sm">
          {icon}
        </div>
      </div>
    </BlurContainer>
  );
}
