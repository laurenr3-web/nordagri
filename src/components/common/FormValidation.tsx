
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
  useEffect(() => {
    if (!farmId && !isSubmitting) {
      toast.error("Impossible de soumettre le formulaire", {
        description: "La ferme n'a pas pu être identifiée"
      });
      onValidationFailed();
    }
  }, [farmId, isSubmitting]); // Adding proper dependencies to prevent infinite loop

  if (!farmId || !isValid) {
    return null;
  }

  return <>{children}</>;
};
