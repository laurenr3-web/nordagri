
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, PackageOpen } from 'lucide-react';
import { StockAlert } from '@/hooks/dashboard/types/dashboardTypes';

interface StockAlertsProps {
  alerts: StockAlert[];
  onViewParts: () => void;
}

export function StockAlerts({ alerts, onViewParts }: StockAlertsProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-6 bg-bg-light rounded-md flex flex-col items-center">
        <CheckCircle className="h-8 w-8 text-agri-primary mb-2" />
        <p className="text-muted-foreground">Tous les stocks sont à niveau</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.slice(0, 4).map((alert) => (
        <div
          key={alert.id}
          className="p-4 rounded-lg bg-white border border-border shadow-card 
                     cursor-pointer hover:bg-muted/10 transition-colors"
          onClick={() => onViewParts()}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                alert.percentRemaining <= 25 ? "bg-alert-red/10 text-alert-red" :
                alert.percentRemaining <= 50 ? "bg-alert-orange/10 text-alert-orange" :
                "bg-agri-primary/10 text-agri-primary"
              )}>
                {alert.percentRemaining <= 25 ? (
                  <AlertTriangle size={16} />
                ) : (
                  <PackageOpen size={16} />
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium">{alert.name}</h4>
                <Badge variant="outline" className="text-xs px-1 py-0 mt-0.5">
                  {alert.category}
                </Badge>
              </div>
            </div>
            <span className="text-xs font-medium bg-muted px-2 py-1 rounded">
              {alert.currentStock}/{alert.reorderPoint}
            </span>
          </div>
          <Progress 
            value={alert.percentRemaining} 
            className="h-2"
            indicatorClassName={
              alert.percentRemaining <= 25 ? "bg-alert-red" :
              alert.percentRemaining <= 50 ? "bg-alert-orange" :
              "bg-agri-primary"
            }
          />
        </div>
      ))}
      {alerts.length > 4 && (
        <div className="text-center text-xs text-muted-foreground pt-1">
          +{alerts.length - 4} autres pièces en stock faible
        </div>
      )}
    </div>
  );
}
