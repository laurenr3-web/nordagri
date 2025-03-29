
import React, { useEffect } from 'react';
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
  // Log des informations de débogage
  useEffect(() => {
    console.log("PartDetailsDialog - Props:", { 
      isOpen, 
      selectedPart: selectedPart?.name,
      hasEditHandler: !!onEdit,
      hasDeleteHandler: !!onDelete
    });
  }, [isOpen, selectedPart, onEdit, onDelete]);

  // Fonctions d'édition et de suppression
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
      // Fermer le dialogue après la suppression
      onOpenChange(false);
    }
  };

  // Éviter les erreurs si une pièce est sélectionnée puis désélectionnée pendant que le dialogue est ouvert
  // Assurons-nous que isValidToRender est explicitement de type boolean
  const isValidToRender: boolean = !!(isOpen && selectedPart);

  // Gérer explicitement l'état de dialogue fermé lorsqu'aucune pièce n'est sélectionnée
  useEffect(() => {
    if (!selectedPart && isOpen) {
      console.log("PartDetailsDialog: Aucune pièce sélectionnée, fermeture du dialogue");
      onOpenChange(false);
    }
  }, [selectedPart, isOpen, onOpenChange]);

  return (
    <Dialog open={isValidToRender} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
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
