import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, Dialog } from '@/components/ui/dialog';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import type { MaintenanceTask } from '@/services/supabase/maintenanceService';
import MaintenanceCompletionForm from '../forms/MaintenanceCompletionForm';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface MaintenanceCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: MaintenanceTask;
  onCompleted?: () => void;
}

const MaintenanceCompletionDialog: React.FC<MaintenanceCompletionDialogProps> = ({ 
  isOpen, 
  onClose, 
  task,
  onCompleted
}) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (data: { actualDuration: number; notes: string; partsUsed: any[] }) => {
    try {
      setIsSubmitting(true);
      
      // Update the task to completed status in Supabase
      await maintenanceService.completeTask(task.id, data.actualDuration, data.notes);
      
      // Show success message
      toast.success('Maintenance task completed successfully');
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      
      // Call the completed callback if provided
      if (onCompleted) {
        onCompleted();
      } else {
        // Otherwise just close the dialog
        onClose();
      }
    } catch (error) {
      console.error('Error completing maintenance task:', error);
      toast.error('Failed to complete maintenance task');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Maintenance Task</DialogTitle>
          <DialogDescription>
            Record completion details for the maintenance task: {task.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <MaintenanceCompletionForm
            task={task}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceCompletionDialog;
