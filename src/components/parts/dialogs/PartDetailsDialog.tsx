
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Part } from '@/types/Part';
import PartDetails from '@/components/parts/PartDetails';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
  const navigate = useNavigate();

  // Validate the part data when it changes
  useEffect(() => {
    if (isOpen && selectedPart) {
      // Check if part ID is valid
      const partId = typeof selectedPart.id === 'string' ? parseInt(selectedPart.id, 10) : selectedPart.id;
      if (isNaN(partId)) {
        console.error('Invalid part ID in PartDetailsDialog:', selectedPart.id);
        toast.error('ID de pièce invalide');
      } else {
        console.log('PartDetailsDialog opened with valid part:', selectedPart.name, 'ID:', partId);
      }
    }
  }, [selectedPart, isOpen]);

  // Function to handle part deletion
  const handleDelete = async (partId: number | string) => {
    try {
      console.log('Tentative de suppression de la pièce:', partId);
      
      if (onDelete) {
        await onDelete(partId);
        
        // Show success toast
        toast.success("Pièce supprimée");
        
        // Close the dialog after deletion
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Error in PartDetailsDialog handleDelete:', error);
      toast.error("Erreur de suppression: " + (error.message || "Une erreur est survenue"));
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
        {!selectedPart && (
          <div className="py-4 text-center text-muted-foreground">
            Aucune pièce sélectionnée. Veuillez sélectionner une pièce pour voir ses détails.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PartDetailsDialog;
