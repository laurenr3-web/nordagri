
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Part } from '@/types/Part';
import EditPartForm from './form/EditPartForm';

interface EditPartDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  part: Part;
  onSubmit: (updatedPart: Part) => void;
}

const EditPartDialog: React.FC<EditPartDialogProps> = ({
  isOpen,
  onOpenChange,
  part,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la pièce</DialogTitle>
          <DialogDescription>
            Modifiez les informations de cette pièce. Cliquez sur enregistrer lorsque vous avez terminé.
          </DialogDescription>
        </DialogHeader>
        
        <EditPartForm 
          part={part} 
          onSubmit={onSubmit} 
          onCancel={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditPartDialog;
