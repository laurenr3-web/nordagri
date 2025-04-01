
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  MaintenanceTask, 
  MaintenancePriority, 
  MaintenanceStatus 
} from '@/hooks/maintenance/maintenanceSlice';
import { useToast } from '@/hooks/use-toast';
import { TaskDetailsBadges } from './components/TaskDetailsBadges';
import { TaskMetadata } from './components/TaskMetadata';
import { TaskControls } from './components/TaskControls';
import { DeleteTaskAlert } from './components/DeleteTaskAlert';

interface TaskDetailsDialogProps {
  task: MaintenanceTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (taskId: number, status: MaintenanceStatus) => void;
  onPriorityChange?: (taskId: number, priority: MaintenancePriority) => void;
  onDeleteTask?: (taskId: number) => void;
}

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  task,
  open,
  onOpenChange,
  onStatusChange,
  onPriorityChange,
  onDeleteTask
}) => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  if (!task) return null;

  const handleStatusChange = (value: string) => {
    if (onStatusChange && task) {
      onStatusChange(task.id, value as MaintenanceStatus);
      toast({
        title: "Status updated",
        description: `Task status updated to ${value}`,
      });
    }
  };

  const handlePriorityChange = (value: string) => {
    if (onPriorityChange && task) {
      onPriorityChange(task.id, value as MaintenancePriority);
      toast({
        title: "Priority updated",
        description: `Task priority updated to ${value}`,
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (onDeleteTask && task) {
      // Fermer d'abord la boîte de dialogue de détails
      onOpenChange(false);
      
      // Important: utiliser requestAnimationFrame pour s'assurer que l'interface est mise à jour
      // avant de procéder à la suppression
      requestAnimationFrame(() => {
        // Utiliser un délai pour s'assurer que les animations sont terminées
        setTimeout(() => {
          if (onDeleteTask) {
            onDeleteTask(task.id);
            toast({
              title: "Task deleted",
              description: "The maintenance task has been deleted",
            });
          }
        }, 350);
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <TaskDetailsBadges 
              task={task} 
              onDeleteClick={() => setShowDeleteDialog(true)} 
            />
            
            <TaskMetadata task={task} />
            
            <TaskControls 
              task={task}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <DeleteTaskAlert 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default TaskDetailsDialog;
