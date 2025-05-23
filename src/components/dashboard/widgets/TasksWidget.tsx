
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CheckSquare, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface TasksWidgetProps {
  data: any[];
  loading: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
}

export const TasksWidget = ({ data, loading, size }: TasksWidgetProps) => {
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
  const tasksToShow = data?.slice(0, displayLimit) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Tâches en cours</h3>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>
      
      <div className="space-y-2">
        {tasksToShow.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 border rounded-lg"
          >
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{task.title}</p>
              <p className="text-xs text-muted-foreground">{task.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
