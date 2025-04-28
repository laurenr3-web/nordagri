
import { ObservationType, UrgencyLevel } from '@/types/FieldObservation';

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
