
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

  // Fonction sécurisée pour fermer la boîte de dialogue
  const safeCloseDialog = () => {
    console.log('Fermeture sécurisée de la boîte de dialogue');
    // Utiliser setTimeout pour éviter les erreurs de manipulation du DOM
    setTimeout(() => {
      onOpenChange(false);
    }, 100);
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        console.log('Part dialog open state change requested:', open);
        // Utiliser setTimeout pour éviter les erreurs de manipulation du DOM
        if (open !== isOpen) {
          setTimeout(() => {
            onOpenChange(open);
          }, 100);
        }
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
              // Utiliser la fonction sécurisée pour fermer la boîte de dialogue
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
