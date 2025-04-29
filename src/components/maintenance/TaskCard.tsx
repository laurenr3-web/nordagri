
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { Calendar, Clock, Info } from 'lucide-react';
import { formatDate } from './MaintenanceUtils';

interface TaskCardProps {
  task: MaintenanceTask;
  onViewDetails: (task: MaintenanceTask) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onViewDetails }) => {
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'critical':
        return 'bg-red-50 border-l-4 border-l-red-500';
      case 'high':
        return 'bg-orange-50 border-l-4 border-l-orange-500';
      case 'medium':
        return 'bg-yellow-50 border-l-4 border-l-yellow-500';
      default:
        return 'bg-green-50 border-l-4 border-l-green-500';
    }
  };
  
  const getStatusBadge = () => {
    switch (task.status) {
      case 'scheduled':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Planifiée</span>;
      case 'in-progress':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">En cours</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Terminée</span>;
      case 'pending-parts':
        return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">En attente</span>;
      case 'cancelled':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Annulée</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{task.status}</span>;
    }
  };

  return (
    <Card 
      className={`w-full mb-4 p-4 shadow-md ${getPriorityColor()}`}
      onClick={() => onViewDetails(task)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h3 className="font-medium text-base sm:text-lg">{task.title}</h3>
            <div className="flex flex-wrap gap-2">
              {getStatusBadge()}
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs capitalize">
                {task.type}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">{task.equipment}</p>
          
          <div className="flex flex-col sm:flex-row gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
            {task.engineHours && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.engineHours} h
              </span>
            )}
            {task.assignedTo && (
              <span>Assigné à: {task.assignedTo}</span>
            )}
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full sm:w-auto mt-2 sm:mt-0"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(task);
          }}
        >
          <Info className="h-4 w-4 mr-1" />
          Détails
        </Button>
      </div>
    </Card>
  );
};

export default TaskCard;
