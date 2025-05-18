
import { useEffect, useRef } from 'react';
import { FieldValues } from 'react-hook-form';

export function useAutoSave<T extends FieldValues>(
  formValues: T,
  hasPendingChanges: boolean,
  setHasPendingChanges: (value: boolean) => void,
  saveDraft: (data: T) => Promise<void>,
  autoSave: boolean = true,
  autoSaveInterval: number = 30000,
  lastSaved: Date | null = null
) {
  const formStateRef = useRef(formValues);

  // Auto-save on form changes
  useEffect(() => {
    if (!autoSave) return;

    // Update ref so we can access current values in the interval
    formStateRef.current = formValues;

    // Only mark as having changes if values are different
    if (lastSaved !== null) {
      setHasPendingChanges(true);
    }

    const intervalId = setInterval(() => {
      const currentValues = formStateRef.current;

      if (!hasPendingChanges) return;

      saveDraft(currentValues as T);
    }, autoSaveInterval);

    return () => clearInterval(intervalId);
  }, [autoSave, autoSaveInterval, formValues, hasPendingChanges, lastSaved, saveDraft, setHasPendingChanges]);

  // Save draft when closing/navigating away
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasPendingChanges) {
        // Auto-save on page exit
        saveDraft(formStateRef.current as T);
        
        // Show confirmation dialog
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasPendingChanges, saveDraft]);

  return {
    formStateRef
  };
}
