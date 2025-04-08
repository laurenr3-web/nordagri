
import React from 'react';
import { cn } from '@/lib/utils';
import { CounterAnimation } from '@/components/ui/counter-animation';
import { typography, transitions, animations, backgrounds } from '@/lib/design-system';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

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
  details?: string | React.ReactNode;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  className,
  style,
  onClick,
  details
}: StatsCardProps) {
  // Détermine si la valeur est un nombre pour l'animation
  const isNumericValue = typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value.replace(/[^0-9.-]+/g, '')));
  const numericValue = isNumericValue ? Number(String(value).replace(/[^0-9.-]+/g, '')) : 0;
  const valuePrefix = typeof value === 'string' ? value.match(/^[^0-9]*/)?.[0] || '' : '';
  const valueSuffix = typeof value === 'string' ? value.match(/[^0-9]*$/)?.[0] || '' : '';
  
  const content = (
    <div 
      className={cn(
        "p-6 bg-white rounded-xl border shadow-md",
        backgrounds.cardGradient,
        transitions.default,
        "hover:shadow-lg",
        onClick && "cursor-pointer",
        animations.fadeIn,
        className
      )}
      style={style}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-sm font-medium text-muted-foreground mb-1", typography.subtitle)}>{title}</p>
          <h3 className={cn("text-2xl font-semibold tracking-tight mb-1", typography.heading1)}>
            {isNumericValue ? (
              <CounterAnimation 
                value={numericValue}
                prefix={valuePrefix}
                suffix={valueSuffix}
              />
            ) : (
              value
            )}
          </h3>
          {description && (
            <p className={cn("text-sm text-muted-foreground", typography.subtitle)}>{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-agri-primary" : "text-alert-red",
                transitions.color
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last season</span>
            </div>
          )}
        </div>
        <div className="relative">
          <div className={cn(
            "h-12 w-12 rounded-full bg-white shadow-md flex items-center justify-center",
            transitions.default
          )}>
            <Icon className="h-6 w-6 text-agri-primary" />
          </div>
          <div className="absolute inset-0 rounded-full" 
               style={{
                 background: `linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)`,
                 opacity: 0.1,
                 zIndex: -1
               }}>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Si des détails sont fournis, ajouter une infobulle
  if (details) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          {content}
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">{title} - Détails</h4>
            {typeof details === 'string' ? (
              <p className="text-sm">{details}</p>
            ) : (
              details
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }
  
  return content;
}
