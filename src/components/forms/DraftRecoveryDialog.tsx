
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DraftRecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecover: () => void;
  onDiscard: () => void;
  lastSaved: Date | null;
  formType: string;
}

export function DraftRecoveryDialog({
  open,
  onOpenChange,
  onRecover,
  onDiscard,
  lastSaved,
  formType
}: DraftRecoveryDialogProps) {
  const formTypeLabels: Record<string, string> = {
    'intervention': 'intervention',
    'observation': 'observation',
    'maintenance': 'maintenance',
    'equipment': 'équipement',
    'part': 'pièce',
    'time-entry': 'suivi de temps'
  };

  const formTypeLabel = formTypeLabels[formType] || formType;

  const lastSavedText = lastSaved
    ? `Dernière sauvegarde: ${lastSaved.toLocaleDateString()} à ${lastSaved.toLocaleTimeString()}`
    : 'Brouillon disponible';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Restaurer le brouillon</DialogTitle>
          <DialogDescription>
            Un brouillon non enregistré de {formTypeLabel} a été trouvé.
            {lastSaved && <p className="mt-2 text-sm">{lastSavedText}</p>}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onDiscard}>
            Ignorer
          </Button>
          <Button onClick={onRecover}>
            Restaurer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
