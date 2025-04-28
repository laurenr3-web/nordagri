
export type ObservationType = 'panne' | 'usure' | 'maintenance' | 'autre';
export type UrgencyLevel = 'normal' | 'surveiller' | 'urgent';

export interface FieldObservationFormValues {
  equipment_id: number;
  equipment: string;
  location?: string;
  description?: string;
  observation_type: ObservationType;
  urgency_level: UrgencyLevel;
  photos: string[];
}

export interface FieldObservation {
  id: number;
  equipment_id: number;
  equipment: string;
  observer_id: string;
  observation_type: ObservationType;
  urgency_level: UrgencyLevel;
  photos: string[];
  location?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
