
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MaintenanceTask, 
  MaintenancePriority, 
  MaintenanceStatus 
} from '@/hooks/maintenance/maintenanceSlice';

interface TaskControlsProps {
  task: MaintenanceTask;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
}

export const TaskControls: React.FC<TaskControlsProps> = ({ 
  task, 
  onStatusChange, 
  onPriorityChange 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">Status</label>
        <Select 
          defaultValue={task.status} 
          onValueChange={onStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending-parts">Pending Parts</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">Priority</label>
        <Select 
          defaultValue={task.priority} 
          onValueChange={onPriorityChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
