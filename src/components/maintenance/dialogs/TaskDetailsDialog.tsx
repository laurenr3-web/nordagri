
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
        title: "Statut mis à jour",
        description: `Statut de la tâche changé à ${value}`,
      });
    }
  };

  const handlePriorityChange = (value: string) => {
    if (onPriorityChange && task) {
      onPriorityChange(task.id, value as MaintenancePriority);
      toast({
        title: "Priorité mise à jour",
        description: `Priorité de la tâche changée à ${value}`,
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (onDeleteTask && task) {
      try {
        // Fermer d'abord la boîte de dialogue de détails
        onOpenChange(false);
        
        // Attendre que le dialogue soit fermé avant de supprimer
        setTimeout(() => {
          if (onDeleteTask) {
            onDeleteTask(task.id);
            
            // Notification après la suppression
            toast({
              title: "Tâche supprimée",
              description: "La tâche de maintenance a été supprimée définitivement",
            });
          }
        }, 100); // Délai réduit pour éviter les problèmes de désynchronisation
        
      } catch (error) {
        console.error('Error deleting task:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la tâche de maintenance",
          variant: "destructive",
        });
      }
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
              <Button variant="outline">Fermer</Button>
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
