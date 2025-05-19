
import { 
  UseFormProps, 
  UseFormReturn, 
  FieldValues, 
  UseFormStateReturn, 
  FieldPath
} from 'react-hook-form';
import { z } from 'zod';

export interface FormDraftRef {
  current: string | null;
}

export interface UseMobileFormProps<T extends FieldValues> extends UseFormProps<T> {
  formType: string;
  formId?: string | number;
  autoSave?: boolean;
  autoSaveInterval?: number;
  onAutoSave?: (data: T) => void;
  onSubmitOffline?: (data: T) => Promise<void>;
  zodSchema?: z.ZodType<any, any>;
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
