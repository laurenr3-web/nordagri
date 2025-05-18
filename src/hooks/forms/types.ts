
import { UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { ZodSchema } from 'zod';

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
  isSubmitting: boolean;
}

export interface FormDraftRef {
  draftId: string | null;
}
