
import React, { useEffect, useRef } from 'react';
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
    console.log('Fermeture sécurisée de la boîte de dialogue');
    // Use requestAnimationFrame instead of setTimeout for better synchronization with browser rendering
    if (isMountedRef.current) {
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          onOpenChange(false);
        }
      });
    }
  };

  // Enhanced error handling when opening/closing the dialog
  const handleOpenChange = (open: boolean) => {
    console.log('Part dialog open state change requested:', open);
    
    if (open !== isOpen && isMountedRef.current) {
      // Use requestAnimationFrame for better timing with rendering cycle
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          onOpenChange(open);
        }
      });
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={handleOpenChange}
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
      </DialogContent>
    </Dialog>
  );
};

export default AddPartDialog;
