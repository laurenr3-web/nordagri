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

interface Props {
  open: boolean;
  taskTitle: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function WorkShiftPunchOutGuard({ open, taskTitle, onConfirm, onCancel }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!next) onCancel(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Une tâche est encore en cours</AlertDialogTitle>
          <AlertDialogDescription>
            {taskTitle
              ? `« ${taskTitle} » est encore active. Voulez-vous l'arrêter avant de terminer la journée ?`
              : "Voulez-vous l'arrêter avant de terminer la journée ?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Arrêter la tâche et punch out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
