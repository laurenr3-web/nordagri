
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import MaintenanceCompletionForm from '../forms/MaintenanceCompletionForm';
import { toast } from 'sonner';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { maintenanceService } from '@/services/supabase/maintenanceService';

interface MaintenanceCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: MaintenanceTask | null;
  onCompleted?: () => void;
}

export default function MaintenanceCompletionDialog({ 
  isOpen, 
  onClose, 
  task,
  onCompleted 
}: MaintenanceCompletionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    if (!task) return;
    
    try {
      setIsSubmitting(true);
      
      // Mettre à jour la tâche avec les données de complétion
      const updatedTask = {
        ...task,
        status: 'completed' as const,
        completedDate: formData.completedDate,
        actualDuration: formData.actualDuration,
        notes: formData.notes,
        assignedTo: formData.technician
      };
      
      // Appeler le service pour mettre à jour la tâche
      await maintenanceService.updateTaskStatus(task.id, 'completed');
      
      // Fermer la boîte de dialogue
      onClose();
      
      // Notification de succès
      toast.success("Maintenance marquée comme complétée");
      
      // Callback après complétion
      if (onCompleted) {
        onCompleted();
      }
      
      // Recharger la page pour voir les mises à jour
      setTimeout(() => window.location.reload(), 1000);
      
    } catch (error: any) {
      console.error("Erreur lors de la complétion de la maintenance:", error);
      toast.error(`Impossible de compléter la maintenance: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si pas de tâche sélectionnée, ne rien afficher
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Compléter la maintenance</DialogTitle>
          <DialogDescription>
            Enregistrez les détails de la maintenance effectuée
          </DialogDescription>
        </DialogHeader>
        
        <MaintenanceCompletionForm
          task={task}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
