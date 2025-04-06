
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
  onMainDialogClose?: () => void;
}

const EditPartDialog: React.FC<EditPartDialogProps> = ({
  isOpen,
  onOpenChange,
  part,
  onSubmit,
  onMainDialogClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] dialog-mobile-friendly">
        <DialogHeader>
          <DialogTitle>Modifier la pièce</DialogTitle>
          <DialogDescription>
            Modifiez les informations de cette pièce. Cliquez sur enregistrer lorsque vous avez terminé.
          </DialogDescription>
        </DialogHeader>
        
        <div className="form-scrollable">
          <EditPartForm 
            part={part} 
            onSubmit={onSubmit} 
            onCancel={() => onOpenChange(false)}
            onMainDialogClose={onMainDialogClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPartDialog;
