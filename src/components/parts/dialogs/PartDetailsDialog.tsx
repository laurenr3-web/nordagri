
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Part } from '@/types/Part';
import PartDetails from '@/components/parts/PartDetails';

interface PartDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPart: Part | null;
  onEdit?: (part: Part) => void;
  onDelete?: (partId: number | string) => void;
}

const PartDetailsDialog: React.FC<PartDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedPart,
  onEdit,
  onDelete
}) => {
  // Fonction pour gérer la suppression d'une pièce
  const handleDelete = (partId: number | string) => {
    if (onDelete) {
      onDelete(partId);
      // Fermer le dialogue après la suppression
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Détails de la pièce</DialogTitle>
          <DialogDescription>
            Informations détaillées sur la pièce sélectionnée
          </DialogDescription>
        </DialogHeader>
        {selectedPart && (
          <PartDetails 
            part={selectedPart} 
            onEdit={onEdit}
            onDelete={handleDelete}
            onDialogClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PartDetailsDialog;
