
import { useEffect } from 'react';
import { toast } from 'sonner';

interface FormValidationProps {
  isValid: boolean;
  farmId: string | null;
  isSubmitting?: boolean;
  onValidationFailed: () => void;
  children: React.ReactNode;
}

export const FormValidation: React.FC<FormValidationProps> = ({
  isValid,
  farmId,
  isSubmitting,
  onValidationFailed,
  children
}) => {
  // Only show the toast error if farm ID is missing and user is attempting to submit
  useEffect(() => {
    if (!farmId && isSubmitting) {
      toast.error("Impossible de soumettre le formulaire", {
        description: "La ferme n'a pas pu être identifiée"
      });
      onValidationFailed();
    }
  }, [farmId, isSubmitting, onValidationFailed]);

  // Still render children even if farm ID is missing, only prevent submission
  if (!isValid) {
    return null;
  }

  return <>{children}</>;
};
