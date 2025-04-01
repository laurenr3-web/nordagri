
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface DeleteTaskAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteTaskAlert: React.FC<DeleteTaskAlertProps> = ({ 
  open, 
  onOpenChange, 
  onConfirm 
}) => {
  const handleConfirm = () => {
    // Fermer d'abord la boîte de dialogue de confirmation
    onOpenChange(false);
    // Ensuite déclencher l'action de confirmation une fois que le dialogue est complètement fermé
    // avec un délai suffisant pour éviter les problèmes d'UI
    setTimeout(() => {
      onConfirm();
    }, 300);
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this maintenance task?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
