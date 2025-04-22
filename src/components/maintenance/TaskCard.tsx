
import React from 'react';
import { ChevronRight, User } from 'lucide-react';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { formatDate, getStatusBadge, getPriorityBadge } from './MaintenanceUtils';

/**
 * Affiche un résumé visuel d'une tâche de maintenance.
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
      className="mb-4 animate-fade-in overflow-hidden"
    >
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="font-semibold text-base mb-1">{task.title}</h3>
            <p className="text-muted-foreground text-xs">{task.equipment}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Due Date</p>
            <p className="font-medium">{formatDate(task.dueDate)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Engine Hours</p>
            <p className="font-medium">
              {task.status === 'completed' && task.actualDuration ? 
                `${task.actualDuration} hrs (Actual)` : 
                `${task.engineHours} hrs`
              }
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
            <div className="flex items-center gap-1">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
              <p className="font-medium text-xs">{task.assignedTo}</p>
            </div>
          </div>
        </div>
        
        {task.notes && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-xs bg-muted p-2 rounded-md">{task.notes}</p>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            className="gap-1 px-4 py-1 text-sm"
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
