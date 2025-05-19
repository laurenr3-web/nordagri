
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, Trash2 } from 'lucide-react';

interface DraftRecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecover: () => Promise<void>;
  onDiscard: () => Promise<void>;
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
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleRecover = async () => {
    setIsLoading(true);
    try {
      await onRecover();
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDiscard = async () => {
    setIsLoading(true);
    try {
      await onDiscard();
    } finally {
      setIsLoading(false);
    }
  };
  
  const formTitle = {
    'intervention': 'Intervention',
    'time-entry': 'Saisie de temps',
    'equipment': 'Équipement',
    'maintenance': 'Maintenance',
  }[formType] || 'Formulaire';
  
  const lastSavedFormatted = lastSaved 
    ? new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short'
      }).format(lastSaved)
    : 'récemment';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Brouillon non enregistré</DialogTitle>
          <DialogDescription>
            Un brouillon de {formTitle.toLowerCase()} sauvegardé automatiquement le {lastSavedFormatted} a été trouvé.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Voulez-vous récupérer ce brouillon ou commencer avec un formulaire vide ?
          </p>
        </div>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleDiscard}
            className="mt-3 sm:mt-0"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer le brouillon
          </Button>
          <Button
            type="button"
            onClick={handleRecover}
            disabled={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            Récupérer le brouillon
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
