
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
  // Create wrapper functions that will pass the necessary arguments
  const handleEdit = () => {
    if (selectedPart && onEdit) {
      onEdit(selectedPart);
    }
  };

  const handleDelete = () => {
    if (selectedPart && onDelete) {
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
          <DialogTitle>Part Details</DialogTitle>
          <DialogDescription>
            Detailed information about the selected part
          </DialogDescription>
        </DialogHeader>
        {selectedPart && (
          <PartDetails 
            part={selectedPart} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDialogClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PartDetailsDialog;
