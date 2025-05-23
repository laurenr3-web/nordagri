
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Wrench, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MaintenanceWidgetProps {
  data: any[];
  loading: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
}

export const MaintenanceWidget = ({ data, loading, size }: MaintenanceWidgetProps) => {
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
  const maintenanceToShow = data?.slice(0, displayLimit) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Maintenance à venir</h3>
        <Button variant="outline" size="sm">
          Voir tout
        </Button>
      </div>
      
      <div className="space-y-2">
        {maintenanceToShow.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 border rounded-lg"
          >
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wrench className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{task.title}</p>
              <p className="text-xs text-muted-foreground">
                {task.equipment} • {format(new Date(task.due_date), 'PPP', { locale: fr })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
