
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
  // Simplifier la gestion de suppression en s'assurant que les événements sont bien séparés
  const handleConfirm = () => {
    // Fermer d'abord la boîte de dialogue
    onOpenChange(false);
    
    // Utiliser requestAnimationFrame pour garantir que le DOM est mis à jour 
    // avant de déclencher l'action de suppression
    requestAnimationFrame(() => {
      onConfirm();
    });
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la tâche</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer cette tâche de maintenance?
            Cette action ne peut pas être annulée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1"
            aria-label="Supprimer la tâche"
          >
            <Trash2 size={16} />
            <span>Supprimer</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
