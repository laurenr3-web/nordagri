
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AlertsWidgetProps {
  data: any[];
  loading: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
  view?: 'compact' | 'detailed';
}

export const AlertsWidget = ({ data, loading, size, view = 'compact' }: AlertsWidgetProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  const displayLimit = view === 'detailed' ? 10 : (size === 'small' ? 2 : 5);
  const alertsToShow = data?.slice(0, displayLimit) || [];

  if (alertsToShow.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Aucune alerte</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {view === 'compact' && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Alertes récentes</h3>
          <Button variant="outline" size="sm">
            Tout effacer
          </Button>
        </div>
      )}
      
      <div className="space-y-2">
        {alertsToShow.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className={cn(
              "mt-0.5 h-2 w-2 rounded-full flex-shrink-0",
              alert.severity === 'high' ? "bg-destructive" : 
              alert.severity === 'medium' ? "bg-yellow-500" : "bg-blue-500"
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{alert.message}</p>
              <p className="text-xs text-muted-foreground">
                {alert.equipment} • {alert.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
