export interface UrgentIntervention {
  id: number;
  title: string;
  equipment: string;
  priority: 'high' | 'medium' | 'low';
  date?: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'; // Using consistent status values
  technician: string;
  location: string;
}

export interface InterventionBase {
  id: number;
  title: string;
  description?: string;
  equipment: string;
  equipmentId: number; // Required to match the model
  priority: 'high' | 'medium' | 'low';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'; // Using consistent status values
  date: Date;
  technician: string;
  location: string;
  notes?: string;
}

// Add the Intervention type
export type Intervention = InterventionBase & {
  scheduledDuration?: number;
  duration?: number;
  partsUsed?: {
    id: number;
    name: string;
    quantity: number;
  }[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  ownerId?: string;
};

export type InterventionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

// Add InterventionFormValues
export interface InterventionFormValues {
  title: string;
  equipment: string;
  equipmentId: number;  // Required to match the model
  location: string;
  priority: 'high' | 'medium' | 'low';
  date: Date;
  scheduledDuration?: number;
  technician?: string;
  description?: string;
  notes?: string;
  status?: InterventionStatus;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
