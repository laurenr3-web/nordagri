
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AddPartForm } from '@/components/parts/AddPartForm';

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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new part to the inventory
          </DialogDescription>
        </DialogHeader>
        <AddPartForm 
          onSuccess={onSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddPartDialog;
