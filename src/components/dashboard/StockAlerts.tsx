
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface StockAlert {
  id: number;
  name: string;
  currentStock: number;
  reorderPoint: number;
  percentRemaining: number;
  category: string;
}

interface StockAlertsProps {
  alerts: StockAlert[];
  onViewParts: () => void;
}

export function StockAlerts({ alerts, onViewParts }: StockAlertsProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Tous les stocks sont à niveau</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.slice(0, 4).map((alert) => (
        <BlurContainer
          key={alert.id}
          className="p-3 cursor-pointer hover:bg-secondary/10 transition-colors"
          intensity="light"
          onClick={() => onViewParts()}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium">{alert.name}</h4>
              <Badge variant="outline" className="text-xs px-1 py-0">
                {alert.category}
              </Badge>
            </div>
            <span className="text-xs font-medium">
              {alert.currentStock}/{alert.reorderPoint}
            </span>
          </div>
          <Progress 
            value={alert.percentRemaining} 
            className="h-1.5"
            indicatorClassName={
              alert.percentRemaining <= 25 ? "bg-destructive" :
              alert.percentRemaining <= 50 ? "bg-orange-500" :
              "bg-emerald-500"
            }
          />
        </BlurContainer>
      ))}
      {alerts.length > 4 && (
        <div className="text-center text-xs text-muted-foreground pt-1">
          +{alerts.length - 4} autres pièces en stock faible
        </div>
      )}
    </div>
  );
}
