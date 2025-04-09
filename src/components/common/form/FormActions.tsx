
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting?: boolean;
  isError?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  hideCancelButton?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ 
  onCancel, 
  isSubmitting = false,
  isError = false,
  saveLabel = 'Enregistrer',
  cancelLabel = 'Annuler',
  hideCancelButton = false
}) => {
  return (
    <DialogFooter>
      {!hideCancelButton && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          aria-label={cancelLabel}
        >
          {cancelLabel}
        </Button>
      )}
      <Button 
        type="submit" 
        className="bg-primary"
        disabled={isSubmitting}
        variant={isError ? "destructive" : "default"}
        aria-label={saveLabel}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {saveLabel}...
          </>
        ) : (
          saveLabel
        )}
      </Button>
    </DialogFooter>
  );
};

export default FormActions;
