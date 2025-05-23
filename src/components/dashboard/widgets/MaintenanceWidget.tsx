
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Wrench, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MaintenanceWidgetProps {
  data: any[];
  loading: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
}

export const MaintenanceWidget = ({ data, loading, size }: MaintenanceWidgetProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-agri-50 to-agri-100 rounded-xl">
              <div className="w-10 h-10 bg-agri-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-agri-200 rounded w-3/4"></div>
                <div className="h-3 bg-agri-150 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const displayLimit = size === 'small' ? 2 : size === 'medium' ? 3 : 5;
  const maintenanceToShow = data?.slice(0, displayLimit) || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-400 to-red-600';
      case 'medium': return 'from-harvest-400 to-harvest-600';
      default: return 'from-agri-400 to-agri-600';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-harvest-50 border-harvest-200';
      default: return 'bg-agri-50 border-agri-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-agri-900">Maintenance à venir</h3>
          <p className="text-sm text-agri-600 mt-1">Tâches planifiées et urgentes</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="border-agri-200 text-agri-700 hover:bg-agri-50 hover:border-agri-300 transition-all duration-200"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Planifier
        </Button>
      </div>
      
      <div className="space-y-3">
        {maintenanceToShow.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className={cn(
              "group relative overflow-hidden rounded-xl border transition-all duration-300",
              "hover:shadow-lg hover:scale-[1.02] cursor-pointer",
              getPriorityBg(task.priority)
            )}
          >
            <div className="flex items-center gap-4 p-4">
              <div className={cn(
                "relative p-3 rounded-xl bg-gradient-to-br shadow-sm",
                getPriorityColor(task.priority)
              )}>
                <Wrench className="h-5 w-5 text-white" />
                {task.priority === 'high' && (
                  <div className="absolute -top-1 -right-1">
                    <AlertTriangle className="h-4 w-4 text-red-500 fill-current" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-agri-900 truncate group-hover:text-agri-700 transition-colors">
                      {task.title}
                    </h4>
                    <p className="text-sm text-agri-600 mt-1">
                      {task.equipment}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-3 w-3 text-agri-500" />
                    <span className="text-agri-600 font-medium">
                      {format(new Date(task.due_date), 'dd MMM', { locale: fr })}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      task.priority === 'high' ? 'bg-red-400' :
                      task.priority === 'medium' ? 'bg-harvest-400' : 'bg-agri-400'
                    )}></div>
                    <span className="text-xs font-medium text-agri-700 uppercase tracking-wide">
                      {task.priority === 'high' ? 'Urgent' : 
                       task.priority === 'medium' ? 'Moyen' : 'Normal'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-agri-500">
                    {task.estimated_duration ? `${task.estimated_duration}h` : ''}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-agri-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </motion.div>
        ))}
      </div>
      
      {maintenanceToShow.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-agri-100 to-agri-200 rounded-full flex items-center justify-center">
            <Wrench className="h-8 w-8 text-agri-500" />
          </div>
          <p className="text-agri-600 font-medium">Aucune maintenance planifiée</p>
          <p className="text-sm text-agri-500 mt-1">Votre flotte est à jour !</p>
        </div>
      )}
    </div>
  );
};
