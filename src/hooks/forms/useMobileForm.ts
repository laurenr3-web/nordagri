import { useState, useEffect, useRef } from 'react';
import { UseFormReturn, useForm, UseFormProps, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { FormDraftService } from '@/services/offline/formDraftService';
import useNetworkState from '@/hooks/useNetworkState';
import { toast } from 'sonner';

export interface UseMobileFormProps<T extends FieldValues> extends UseFormProps<T> {
  formType: string;
  formId?: string | number;
  autoSave?: boolean;
  autoSaveInterval?: number;
  onAutoSave?: (data: T) => void;
  zodSchema?: ZodSchema<any>;
  onSubmitOffline?: (data: T) => Promise<void>;
  isDraftAvailable?: boolean;
}

export interface UseMobileFormReturn<T extends FieldValues> extends UseFormReturn<T> {
  isAutoSaving: boolean;
  lastSaved: Date | null;
  isDraftAvailable: boolean;
  hasPendingChanges: boolean;
  recoverDraft: () => Promise<boolean>;
  discardDraft: () => Promise<void>;
  saveDraftManually: () => Promise<void>;
  isOnline: boolean;
  isSubmitting: boolean; // Added isSubmitting property
}

export function useMobileForm<T extends FieldValues>({
  formType,
  formId,
  autoSave = true,
  autoSaveInterval = 30000, // 30 seconds
  onAutoSave,
  zodSchema,
  onSubmitOffline,
  isDraftAvailable: initialIsDraftAvailable = false,
  ...formProps
}: UseMobileFormProps<T>): UseMobileFormReturn<T> {
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDraftAvailable, setIsDraftAvailable] = useState<boolean>(initialIsDraftAvailable);
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Added isSubmitting state
  const draftIdRef = useRef<string | null>(null);
  const isOnline = useNetworkState();

  // Use the schema resolver if provided
  const resolverProps = zodSchema
    ? { resolver: zodResolver(zodSchema) }
    : {};

  const form = useForm<T>({
    ...formProps,
    ...resolverProps
  });

  const { watch } = form;
  const formValues = watch();
  const formStateRef = useRef(formValues);

  // Function to save draft
  const saveDraft = async (data: T): Promise<void> => {
    try {
      setIsAutoSaving(true);
      const draftId = await FormDraftService.saveDraft(
        formType,
        data,
        formId
      );
      draftIdRef.current = draftId;
      setLastSaved(new Date());
      setIsDraftAvailable(true);
      setHasPendingChanges(false);
      onAutoSave?.(data);
    } catch (error) {
      console.error('Error auto-saving form:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  // Check for existing drafts on mount
  useEffect(() => {
    const checkForDrafts = async () => {
      try {
        const drafts = await FormDraftService.getDraftsByType(formType);
        const relevantDraft = drafts.find(draft => draft.formId === formId);
        
        if (relevantDraft) {
          draftIdRef.current = relevantDraft.id;
          setIsDraftAvailable(true);
        }
      } catch (error) {
        console.error('Error checking for drafts:', error);
      }
    };

    checkForDrafts();
  }, [formType, formId]);

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
  }, [autoSave, autoSaveInterval, formValues, hasPendingChanges]);

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
  }, [hasPendingChanges]);

  // Recover draft function
  const recoverDraft = async (): Promise<boolean> => {
    if (!draftIdRef.current) {
      // Try to find a draft for this form type and ID
      const drafts = await FormDraftService.getDraftsByType<T>(formType);
      const draft = drafts.find(d => d.formId === formId);
      
      if (!draft) {
        return false;
      }
      
      draftIdRef.current = draft.id;
    }
    
    try {
      const draft = await FormDraftService.getDraft<T>(draftIdRef.current);
      
      if (!draft) {
        return false;
      }
      
      // Reset form with draft data
      form.reset(draft.data);
      setLastSaved(new Date(draft.lastSaved));
      toast.info("Brouillon restauré", {
        description: `Dernière sauvegarde: ${new Date(draft.lastSaved).toLocaleTimeString()}`
      });
      
      return true;
    } catch (error) {
      console.error('Error recovering draft:', error);
      return false;
    }
  };

  // Discard draft function
  const discardDraft = async (): Promise<void> => {
    if (draftIdRef.current) {
      try {
        await FormDraftService.removeDraft(draftIdRef.current);
        draftIdRef.current = null;
        setIsDraftAvailable(false);
        setHasPendingChanges(false);
        toast.info("Brouillon supprimé");
      } catch (error) {
        console.error('Error discarding draft:', error);
      }
    }
  };

  // Manual save function
  const saveDraftManually = async (): Promise<void> => {
    await saveDraft(formValues as T);
    toast.success("Brouillon sauvegardé manuellement");
  };

  // Handle offline submission
  const originalHandleSubmit = form.handleSubmit;
  form.handleSubmit = (onValidSubmit, onInvalidSubmit) => {
    return originalHandleSubmit(async (data) => {
      setIsSubmitting(true); // Set submitting state to true
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
        setIsSubmitting(false); // Set submitting state back to false when done
      }
    }, onInvalidSubmit);
  };

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
    isSubmitting // Return the isSubmitting state
  };
}
