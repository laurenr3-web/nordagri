
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { getStatusBadge, getPriorityBadge, formatDate } from '../MaintenanceUtils';
import { Clock, Calendar, FileText, Tool, User } from 'lucide-react';

interface TaskDetailsDialogProps {
  task: MaintenanceTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  task,
  open,
  onOpenChange
}) => {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex gap-2 items-start">
              <Tool className="h-5 w-5 text-muted-foreground mt-0.5" />
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
            <div className="mb-2 flex gap-2 items-start">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="bg-secondary/50 p-3 rounded-md mt-1">{task.notes}</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;
