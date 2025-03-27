
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting?: boolean;
  isError?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ 
  onCancel, 
  isSubmitting = false,
  isError = false
}) => {
  return (
    <DialogFooter>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        aria-label="Annuler les modifications"
      >
        Annuler
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        variant={isError ? "destructive" : "default"}
        aria-label="Enregistrer les modifications"
      >
        {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </Button>
    </DialogFooter>
  );
};

export default FormActions;
