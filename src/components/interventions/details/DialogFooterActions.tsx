
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Intervention } from '@/types/Intervention';

interface DialogFooterActionsProps {
  onClose: () => void;
  intervention?: Intervention;
  onStartWork: (intervention: Intervention) => void;
}

const DialogFooterActions: React.FC<DialogFooterActionsProps> = ({
  onClose,
  intervention,
  onStartWork
}) => {
  const handleStartWork = () => {
    if (intervention) {
      onStartWork(intervention);
      onClose();
    } else {
      toast.error("Impossible de démarrer l'intervention");
    }
  };
  
  return (
    <>
      <Button type="button" variant="secondary" onClick={onClose}>
        Fermer
      </Button>
      {intervention && intervention.status === 'scheduled' && (
        <Button type="button" onClick={handleStartWork}>
          Démarrer
        </Button>
      )}
      {intervention && intervention.status === 'in-progress' && (
        <Button type="button" variant="outline">
          Terminer
        </Button>
      )}
    </>
  );
};

export default DialogFooterActions;
