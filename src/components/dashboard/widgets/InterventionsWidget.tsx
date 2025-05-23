
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InterventionsWidgetProps {
  data: any[];
  loading: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
}

export const InterventionsWidget = ({ data, loading, size }: InterventionsWidgetProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  const displayLimit = size === 'small' ? 2 : size === 'medium' ? 3 : 5;
  const interventionsToShow = data?.slice(0, displayLimit) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Interventions urgentes</h3>
        <Button variant="outline" size="sm">
          Voir tout
        </Button>
      </div>
      
      <div className="space-y-2">
        {interventionsToShow.map((intervention, index) => (
          <motion.div
            key={intervention.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 border rounded-lg"
          >
            <div className={cn(
              "p-2 rounded-lg",
              intervention.priority === 'high' ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
            )}>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{intervention.title}</p>
              <p className="text-xs text-muted-foreground">
                {intervention.equipment} • {intervention.location}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
