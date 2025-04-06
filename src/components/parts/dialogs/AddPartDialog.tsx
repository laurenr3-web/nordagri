
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AddPartForm } from '@/components/parts/AddPartForm';
import { PartFormValues } from '@/components/parts/form/partFormTypes';

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
  // The function will be called only once when the form submission is successful
  const handleSuccess = (data: PartFormValues) => {
    // First call the parent's onSuccess handler if provided
    if (onSuccess) {
      onSuccess(data);
    }
    
    // Then close the dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl dialog-mobile-friendly">
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new part to the inventory
          </DialogDescription>
        </DialogHeader>
        <div className="form-scrollable">
          <AddPartForm 
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPartDialog;
