
import React from 'react';
import { ChevronRight, User } from 'lucide-react';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { formatDate, getStatusBadge, getPriorityBadge } from './MaintenanceUtils';

/**
 * Affiche un résumé visuel d’une tâche de maintenance.
 * @param task Données de tâche
 * @param onViewDetails Callback pour ouvrir les détails
 */
interface TaskCardProps {
  task: MaintenanceTask;
  onViewDetails: (task: MaintenanceTask) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onViewDetails }) => {
  return (
    <BlurContainer 
      key={task.id}
      className="mb-md animate-fade-in overflow-hidden"
    >
      <div className="p-md">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-sm mb-md">
          <div>
            <h3 className="font-semibold text-base mb-xs">{task.title}</h3>
            <p className="text-muted-foreground text-xs">{task.equipment}</p>
          </div>
          <div className="flex flex-wrap gap-xs">
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md mb-md">
          <div>
            <p className="text-xs text-muted-foreground mb-xs">Due Date</p>
            <p className="font-medium">{formatDate(task.dueDate)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-xs">Engine Hours</p>
            <p className="font-medium">
              {task.status === 'completed' && task.actualDuration ? 
                `${task.actualDuration} hrs (Actual)` : 
                `${task.engineHours} hrs`
              }
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-xs">Assigned To</p>
            <div className="flex items-center gap-xs">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
              <p className="font-medium text-xs">{task.assignedTo}</p>
            </div>
          </div>
        </div>
        
        {task.notes && (
          <div className="mb-md">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-xs bg-secondary/40 p-2 rounded-md">{task.notes}</p>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            className="gap-xs px-md py-xs text-sm"
            onClick={() => onViewDetails(task)}
          >
            <span>Détails</span>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </BlurContainer>
  );
};

export default TaskCard;
