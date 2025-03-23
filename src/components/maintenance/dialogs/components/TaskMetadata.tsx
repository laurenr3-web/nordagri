
import React from 'react';
import { formatDate } from '../../MaintenanceUtils';
import { Wrench, User, Calendar, Clock, FileText } from 'lucide-react';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';

interface TaskMetadataProps {
  task: MaintenanceTask;
}

export const TaskMetadata: React.FC<TaskMetadataProps> = ({ task }) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex gap-2 items-start">
          <Wrench className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Equipment</p>
            <p className="font-medium">{task.equipment} (ID: {task.equipmentId})</p>
          </div>
        </div>
        
        <div className="flex gap-2 items-start">
          <User className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Assigned To</p>
            <p className="font-medium">{task.assignedTo}</p>
          </div>
        </div>
        
        <div className="flex gap-2 items-start">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Due Date</p>
            <p className="font-medium">{formatDate(task.dueDate)}</p>
          </div>
        </div>
        
        <div className="flex gap-2 items-start">
          <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium">
              {task.status === 'completed' && task.actualDuration ? 
                `${task.actualDuration} hrs (Actual)` : 
                `${task.estimatedDuration} hrs (Est.)`
              }
            </p>
          </div>
        </div>
      </div>
      
      {task.completedDate && (
        <div className="mb-4 flex gap-2 items-start">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Completed Date</p>
            <p className="font-medium">{formatDate(task.completedDate)}</p>
          </div>
        </div>
      )}
      
      {task.notes && (
        <div className="mb-4 flex gap-2 items-start">
          <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Notes</p>
            <p className="bg-secondary/50 p-3 rounded-md mt-1">{task.notes}</p>
          </div>
        </div>
      )}
    </>
  );
};
