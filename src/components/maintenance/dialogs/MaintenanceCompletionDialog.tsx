
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import type { MaintenanceTask } from '@/services/supabase/maintenanceService';
import MaintenanceCompletionForm from '../forms/MaintenanceCompletionForm';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface MaintenanceCompletionDialogProps {
  task: MaintenanceTask;
  onClose: () => void;
}

const MaintenanceCompletionDialog: React.FC<MaintenanceCompletionDialogProps> = ({ task, onClose }) => {
  const queryClient = useQueryClient();
  
  const handleSubmit = async (data: { actualDuration: number; notes: string; partsUsed: any[] }) => {
    try {
      // Update the task to completed status in Supabase
      await maintenanceService.completeTask(task.id, data.actualDuration, data.notes);
      
      // Show success message
      toast.success('Maintenance task completed successfully');
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error('Error completing maintenance task:', error);
      toast.error('Failed to complete maintenance task');
    }
  };
  
  return (
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
        />
      </div>
    </DialogContent>
  );
};

export default MaintenanceCompletionDialog;
