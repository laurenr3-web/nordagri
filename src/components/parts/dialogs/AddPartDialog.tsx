
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AddPartForm from '@/components/parts/AddPartForm';

interface AddPartDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (data: any) => void;
}

const AddPartDialog: React.FC<AddPartDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess
}) => {
  // Log when dialog state changes
  useEffect(() => {
    console.log('AddPartDialog state changed:', { isOpen });
  }, [isOpen]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        console.log('Part dialog open state change requested:', open);
        // Use setTimeout to prevent React DOM manipulation errors
        setTimeout(() => {
          onOpenChange(open);
        }, 50);
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle pièce</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire ci-dessous pour ajouter une nouvelle pièce à l'inventaire
          </DialogDescription>
        </DialogHeader>
        <AddPartForm 
          onSuccess={(data) => {
            console.log('AddPartForm success', data);
            if (onSuccess) {
              onSuccess(data);
            }
          }}
          onCancel={() => {
            console.log('Cancel button clicked in AddPartForm');
            setTimeout(() => onOpenChange(false), 50);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddPartDialog;
