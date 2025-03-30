import React, { useEffect, useRef } from 'react';
import SafeDialog, { SafeDialogContent, SafeDialogHeader, SafeDialogTitle, SafeDialogDescription } from '@/components/ui/dialog/SafeDialog';
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
  // Use a ref to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Log when dialog state changes
  useEffect(() => {
    console.log('AddPartDialog state changed:', { isOpen });
    
    // Setup cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [isOpen]);

  // Safe method to close the dialog
  const safeCloseDialog = () => {
    console.log('Safely closing dialog');
    if (isMountedRef.current) {
      onOpenChange(false);
    }
  };

  return (
    <SafeDialog 
      open={isOpen} 
      onOpenChange={onOpenChange}
    >
      <SafeDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <SafeDialogHeader>
          <SafeDialogTitle>Ajouter une nouvelle pièce</SafeDialogTitle>
          <SafeDialogDescription>
            Remplissez le formulaire ci-dessous pour ajouter une nouvelle pièce à l'inventaire
          </SafeDialogDescription>
        </SafeDialogHeader>
        <AddPartForm 
          onSuccess={(data) => {
            console.log('AddPartForm success', data);
            if (onSuccess && isMountedRef.current) {
              onSuccess(data);
              safeCloseDialog();
            }
          }}
          onCancel={() => {
            console.log('Cancel button clicked in AddPartForm');
            safeCloseDialog();
          }}
        />
      </SafeDialogContent>
    </SafeDialog>
  );
};

export default AddPartDialog;
