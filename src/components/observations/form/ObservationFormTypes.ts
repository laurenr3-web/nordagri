
import { ObservationType, UrgencyLevel } from '@/types/FieldObservation';
import { z } from 'zod';
import { observationFormSchema } from './validationSchema';

export type ObservationFormValues = z.infer<typeof observationFormSchema>;

export interface ObservationFormData {
  equipment_id?: number | null;
  observation_type?: ObservationType;
  urgency_level?: UrgencyLevel;
  location?: string;
  description?: string;
  photos?: string[];
}

export interface PreviewImage {
  file: File;
  preview: string;
}

export interface FormErrors {
  equipment_id?: string;
  observation_type?: string;
  urgency_level?: string;
  location?: string;
  description?: string;
  photos?: string;
  submit?: string;
}
