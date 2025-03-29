
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
  // Créer des fonctions wrapper qui passeront les arguments nécessaires
  const handleEdit = () => {
    if (selectedPart && onEdit) {
      console.log("PartDetailsDialog: Édition de la pièce", selectedPart.name);
      onEdit(selectedPart);
    }
  };

  const handleDelete = () => {
    if (selectedPart && onDelete) {
      console.log("PartDetailsDialog: Suppression de la pièce", selectedPart.name);
      onDelete(selectedPart.id);
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
        {selectedPart ? (
          <PartDetails 
            part={selectedPart} 
            onEdit={onEdit ? handleEdit : undefined}
            onDelete={onDelete ? handleDelete : undefined}
            onDialogClose={() => onOpenChange(false)}
          />
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Aucune pièce sélectionnée
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PartDetailsDialog;
