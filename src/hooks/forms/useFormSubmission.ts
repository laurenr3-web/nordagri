
import { useCallback, useState } from 'react';
import { UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

export function useFormSubmission<T extends FieldValues>(
  form: UseFormReturn<T>,
  isOnline: boolean,
  onSubmitOffline?: (data: T) => Promise<void>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Custom handleSubmit function that wraps the original react-hook-form handleSubmit
  const customHandleSubmit = useCallback(
    (onValidSubmit: SubmitHandler<T>) => {
      return async (event?: React.BaseSyntheticEvent) => {
        event?.preventDefault();
        
        // Use the original handleSubmit to validate the form
        const validateForm = form.handleSubmit(async (data: T) => {
          try {
            setIsSubmitting(true);
            
            if (!isOnline && onSubmitOffline) {
              // Handle offline submission
              await onSubmitOffline(data);
            } else {
              // Handle online submission
              await onValidSubmit(data);
            }
          } catch (error: any) {
            console.error('Form submission error:', error);
            toast.error('Erreur lors de la soumission', {
              description: error.message || 'Veuillez réessayer.'
            });
          } finally {
            setIsSubmitting(false);
          }
        });
        
        return validateForm(event);
      };
    },
    [form, isOnline, onSubmitOffline]
  );
  
  return { isSubmitting, customHandleSubmit };
}
