import { useState } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';

export function useFormSubmission<T extends FieldValues>(
  form: UseFormReturn<T>,
  isOnline: boolean,
  onSubmitOffline?: (data: T) => Promise<void>
) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Handle offline submission
  const originalHandleSubmit = form.handleSubmit;
  const customHandleSubmit = (onValidSubmit: (data: T) => Promise<void> | void, onInvalidSubmit?: Parameters<typeof originalHandleSubmit>[1]) => {
    return originalHandleSubmit(async (data) => {
      setIsSubmitting(true);
      try {
        if (!isOnline && onSubmitOffline) {
          // If offline, handle submission differently
          await onSubmitOffline(data);
        } else {
          // Otherwise proceed with normal submission
          await onValidSubmit(data);
        }
      } catch (error) {
        console.error("Form submission error:", error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    }, onInvalidSubmit);
  };

  return {
    isSubmitting,
    customHandleSubmit
  };
}
