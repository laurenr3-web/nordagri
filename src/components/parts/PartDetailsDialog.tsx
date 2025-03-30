
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Part } from '@/types/Part';
import PartDetails from '@/components/parts/PartDetails';
import { useNavigate } from 'react-router-dom';

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

  // Function to handle part deletion
  const handleDelete = async (partId: number | string) => {
    try {
      if (onDelete) {
        await onDelete(partId);
      }
      
      // Close the dialog after deletion
      onOpenChange(false);
      
      // Refresh the page to ensure deleted items don't appear
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error in PartDetailsDialog handleDelete:', error);
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
