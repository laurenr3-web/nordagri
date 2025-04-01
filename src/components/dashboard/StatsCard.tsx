
import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
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
  icon: Icon, 
  description, 
  trend, 
  className,
  style,
  onClick
}: StatsCardProps) {
  return (
    <div 
      className={cn(
        "p-6 animate-fade-in bg-white rounded-xl border border-border shadow-card card-hover",
        className,
        onClick && "cursor-pointer"
      )}
      style={style}
      onClick={onClick}
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
                trend.isPositive ? "text-agri-primary" : "text-alert-red"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last season</span>
            </div>
          )}
        </div>
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-white shadow-md flex items-center justify-center">
            <Icon className="h-6 w-6 text-agri-primary" />
          </div>
          <div className="absolute inset-0 rounded-full" 
               style={{
                 background: `linear-gradient(135deg, var(--agri-primary) 0%, var(--agri-secondary) 100%)`,
                 opacity: 0.1,
                 zIndex: -1
               }}>
          </div>
        </div>
      </div>
    </div>
  );
}
