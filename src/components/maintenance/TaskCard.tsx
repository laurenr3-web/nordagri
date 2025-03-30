
import React from 'react';
import { ChevronRight, User } from 'lucide-react';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { formatDate, getStatusBadge, getPriorityBadge } from './MaintenanceUtils';

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
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="font-medium text-lg leading-tight mb-1">{task.title}</h3>
            <p className="text-muted-foreground">{task.equipment}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Due Date</p>
            <p className="font-medium">{formatDate(task.dueDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Engine Hours</p>
            <p className="font-medium">
              {task.status === 'completed' && task.actualDuration ? 
                `${task.actualDuration} hrs (Actual)` : 
                `${task.engineHours} hrs`
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Assigned To</p>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
              <p className="font-medium">{task.assignedTo}</p>
            </div>
          </div>
        </div>
        
        {task.notes && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Notes</p>
            <p className="text-sm bg-secondary/50 p-3 rounded-md">{task.notes}</p>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            className="gap-1"
            onClick={() => onViewDetails(task)}
          >
            <span>Details</span>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </BlurContainer>
  );
};

export default TaskCard;
