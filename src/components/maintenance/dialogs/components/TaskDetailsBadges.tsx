
import React from 'react';
import { getStatusBadge, getPriorityBadge } from '../../MaintenanceUtils';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';

interface TaskDetailsBadgesProps {
  task: MaintenanceTask;
  onDeleteClick: () => void;
}

export const TaskDetailsBadges: React.FC<TaskDetailsBadgesProps> = ({ 
  task, 
  onDeleteClick 
}) => {
  return (
    <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
      <div className="flex flex-wrap gap-2">
        {getStatusBadge(task.status)}
        {getPriorityBadge(task.priority)}
      </div>
      
      <Button 
        variant="destructive" 
        size="sm" 
        className="gap-1"
        onClick={onDeleteClick}
      >
        <Trash2 size={16} />
        <span>Delete</span>
      </Button>
    </div>
  );
};
