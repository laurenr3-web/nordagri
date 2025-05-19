
import { useState, useRef, useEffect } from 'react';
import { FieldValues } from 'react-hook-form';
import { FormDraftService } from '@/services/offline/formDraftService';
import { toast } from 'sonner';
import { FormDraftRef } from './types';

export function useDraftManager<T extends FieldValues>(
  formType: string, 
  formId?: string | number, 
  initialIsDraftAvailable: boolean = false,
  onAutoSave?: (data: T) => void
) {
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDraftAvailable, setIsDraftAvailable] = useState<boolean>(initialIsDraftAvailable);
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);
  const draftIdRef = useRef<string | null>(null);

  // Function to save draft
  const saveDraft = async (data: T): Promise<void> => {
    try {
      setIsAutoSaving(true);
      const draftId = await FormDraftService.saveDraft(
        formType,
        data,
        formId ? { formId } : undefined
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
        const drafts = await FormDraftService.getDraftsByType<T>(formType);
        const relevantDraft = drafts.find(draft => 
          draft.meta && typeof draft.meta === 'object' && 
          'formId' in draft.meta && draft.meta.formId === formId
        );
        
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

  // Recover draft function
  const recoverDraft = async (): Promise<boolean> => {
    if (!draftIdRef.current) {
      // Try to find a draft for this form type and ID
      const drafts = await FormDraftService.getDraftsByType<T>(formType);
      const draft = drafts.find(d => 
        d.meta && typeof d.meta === 'object' && 
        'formId' in d.meta && d.meta.formId === formId
      );
      
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
      
      setLastSaved(new Date(draft.updatedAt));
      toast.info("Brouillon restauré", {
        description: `Dernière sauvegarde: ${new Date(draft.updatedAt).toLocaleTimeString()}`
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
  const saveDraftManually = async (data: T): Promise<void> => {
    await saveDraft(data);
    toast.success("Brouillon sauvegardé manuellement");
  };

  return {
    isAutoSaving,
    lastSaved,
    isDraftAvailable,
    hasPendingChanges,
    setHasPendingChanges,
    saveDraft,
    recoverDraft,
    discardDraft,
    saveDraftManually,
    draftIdRef
  };
}
