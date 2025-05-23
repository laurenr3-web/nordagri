
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CheckSquare, Plus, Clock, User, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TasksWidgetProps {
  data: any[];
  loading: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
}

export const TasksWidget = ({ data, loading, size }: TasksWidgetProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-agri-50 to-agri-100 rounded-xl">
              <div className="w-5 h-5 bg-agri-200 rounded"></div>
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
  const tasksToShow = data?.slice(0, displayLimit) || [];

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Flag className="h-3 w-3 text-red-500" />;
      case 'medium': return <Flag className="h-3 w-3 text-harvest-500" />;
      default: return <Flag className="h-3 w-3 text-agri-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-agri-900">Tâches en cours</h3>
          <p className="text-sm text-agri-600 mt-1">Activités à réaliser</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="border-agri-200 text-agri-700 hover:bg-agri-50 hover:border-agri-300 transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>
      
      <div className="space-y-3">
        {tasksToShow.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="group flex items-start gap-4 p-4 bg-gradient-to-r from-white to-agri-25 border border-agri-100 rounded-xl hover:shadow-md hover:border-agri-200 transition-all duration-300 cursor-pointer"
          >
            <div className="mt-1">
              <div className="w-5 h-5 border-2 border-agri-300 rounded group-hover:border-agri-500 transition-colors duration-200 flex items-center justify-center">
                <CheckSquare className="h-3 w-3 text-agri-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-agri-900 group-hover:text-agri-700 transition-colors line-clamp-1">
                  {task.title}
                </h4>
                <div className="flex items-center gap-1 ml-2">
                  {getPriorityIcon(task.priority)}
                </div>
              </div>
              
              <p className="text-sm text-agri-600 mb-3 line-clamp-2">
                {task.description}
              </p>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-agri-500">
                    <Clock className="h-3 w-3" />
                    <span>{task.estimated_time || '2h'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-agri-500">
                    <User className="h-3 w-3" />
                    <span>{task.assignee || 'Non assigné'}</span>
                  </div>
                </div>
                
                <div className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  task.status === 'pending' ? 'bg-harvest-100 text-harvest-700' :
                  'bg-agri-100 text-agri-700'
                )}>
                  {task.status === 'in_progress' ? 'En cours' :
                   task.status === 'pending' ? 'En attente' : 'Nouveau'}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {tasksToShow.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-agri-100 to-agri-200 rounded-full flex items-center justify-center">
            <CheckSquare className="h-8 w-8 text-agri-500" />
          </div>
          <p className="text-agri-600 font-medium">Aucune tâche en cours</p>
          <p className="text-sm text-agri-500 mt-1">Créez votre première tâche</p>
        </div>
      )}
    </div>
  );
};
