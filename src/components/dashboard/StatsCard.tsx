
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
        <div className="h-12 w-12 rounded-full flex items-center justify-center text-white"
             style={{
               background: `linear-gradient(135deg, var(--agri-primary) 0%, var(--agri-secondary) 100%)`,
               boxShadow: '0 4px 10px rgba(45, 157, 100, 0.2)'
             }}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
