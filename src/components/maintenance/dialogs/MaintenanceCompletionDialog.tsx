
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { useToast } from '@/hooks/use-toast';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import MaintenanceCompletionForm from '@/components/maintenance/forms/MaintenanceCompletionForm';

interface MaintenanceCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: MaintenanceTask | null;
  onCompleted?: () => void;
  userName?: string;
}

const MaintenanceCompletionDialog: React.FC<MaintenanceCompletionDialogProps> = ({
  isOpen,
  onClose,
  task,
  onCompleted,
  userName = 'Utilisateur'
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!task) return null;

  const handleSubmit = async (data: any) => {
    if (!task) return;
    
    try {
      setIsSubmitting(true);
      
      // Ensure technician is set to user's name if empty
      if (!data.technician) {
        data.technician = userName;
      }
      
      await maintenanceService.completeTask(task.id, {
        completedDate: data.completedDate,
        actualDuration: data.actualDuration,
        notes: data.notes,
        technician: data.technician
      });
      
      toast({
        title: "Tâche complétée avec succès",
        description: "La tâche de maintenance a été marquée comme terminée.",
      });
      
      onClose();
      if (onCompleted) {
        onCompleted();
      }
      
      // Reload the page after a short delay
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error('Error completing task:', error);
      toast({
        title: "Erreur",
        description: `Impossible de compléter la tâche: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Compléter la tâche de maintenance</DialogTitle>
        </DialogHeader>
        
        <MaintenanceCompletionForm 
          task={task} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceCompletionDialog;
