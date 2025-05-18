
import { useForm, UseFormProps, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useNetworkState from '@/hooks/useNetworkState';
import { useDraftManager } from './useDraftManager';
import { useAutoSave } from './useAutoSave';
import { useFormSubmission } from './useFormSubmission';
import { UseMobileFormProps, UseMobileFormReturn } from './types';

export { UseMobileFormProps, UseMobileFormReturn } from './types';

export function useMobileForm<T extends FieldValues>({
  formType,
  formId,
  autoSave = true,
  autoSaveInterval = 30000,
  onAutoSave,
  zodSchema,
  onSubmitOffline,
  isDraftAvailable: initialIsDraftAvailable = false,
  ...formProps
}: UseMobileFormProps<T>): UseMobileFormReturn<T> {
  const isOnline = useNetworkState();

  // Use the schema resolver if provided
  const resolverProps = zodSchema
    ? { resolver: zodResolver(zodSchema) }
    : {};

  const form = useForm<T>({
    ...formProps,
    ...resolverProps
  });

  const { watch, reset } = form;
  const formValues = watch();

  // Initialize draft management
  const {
    isAutoSaving,
    lastSaved,
    isDraftAvailable,
    hasPendingChanges,
    setHasPendingChanges,
    saveDraft,
    recoverDraft: baseDraftRecovery,
    discardDraft,
    saveDraftManually: baseSaveDraftManually,
  } = useDraftManager<T>(formType, formId, initialIsDraftAvailable, onAutoSave);

  // Initialize auto-save functionality
  const { formStateRef } = useAutoSave<T>(
    formValues,
    hasPendingChanges,
    setHasPendingChanges,
    saveDraft,
    autoSave,
    autoSaveInterval,
    lastSaved
  );

  // Initialize form submission handling
  const { isSubmitting, customHandleSubmit } = useFormSubmission<T>(
    form,
    isOnline,
    onSubmitOffline
  );

  // Extend recoverDraft to reset the form with recovered data
  const recoverDraft = async (): Promise<boolean> => {
    const draftRecovered = await baseDraftRecovery();
    
    if (draftRecovered && formStateRef.current) {
      // Reset form with draft data
      reset(formStateRef.current);
    }
    
    return draftRecovered;
  };

  // Extend manual save to use current form values
  const saveDraftManually = async (): Promise<void> => {
    await baseSaveDraftManually(formValues as T);
  };

  // Override handleSubmit with our custom version
  form.handleSubmit = customHandleSubmit;

  return {
    ...form,
    isAutoSaving,
    lastSaved,
    isDraftAvailable,
    hasPendingChanges,
    recoverDraft,
    discardDraft,
    saveDraftManually,
    isOnline,
    isSubmitting
  };
}
