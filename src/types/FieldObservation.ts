
import { Intervention } from './Intervention';

// Niveaux d'urgence possibles pour les observations
export type UrgencyLevel = 'normal' | 'surveiller' | 'urgent';

// Types d'observations possibles (à étendre selon les besoins)
export type ObservationType = 
  | 'panne' 
  | 'usure' 
  | 'anomalie' 
  | 'entretien' 
  | 'autre';

// Extension du type Intervention existant pour y inclure les champs d'observation
export interface FieldObservation extends Intervention {
  observer_id?: string;
  observation_type?: ObservationType;
  urgency_level?: UrgencyLevel;
  photos?: string[];
}

// Données nécessaires pour créer une nouvelle observation
export interface FieldObservationFormValues {
  equipment_id: number;
  equipment: string;
  observation_type: ObservationType;
  urgency_level: UrgencyLevel;
  description: string;
  photos?: string[];
  location?: string;
}
