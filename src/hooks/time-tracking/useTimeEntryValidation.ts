
import { useState } from 'react';
import { TimeEntryFormData } from './types';

export function useTimeEntryValidation() {
  const [formError, setFormError] = useState<string | null>(null);

  const validateForm = (formData: TimeEntryFormData): boolean => {
    if (!formData.equipment_id) {
      setFormError("Please select an equipment");
      return false;
    }
    
    if (formData.task_type === 'other' && !formData.custom_task_type?.trim()) {
      setFormError("Please enter a custom task type");
      return false;
    }

    // Clear any previous errors if validation passes
    setFormError(null);
    return true;
  };

  return {
    formError,
    setFormError,
    validateForm
  };
}
