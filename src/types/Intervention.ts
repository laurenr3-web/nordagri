
export interface UrgentIntervention {
  id: number;
  title: string;
  equipment: string;
  priority: 'high' | 'medium' | 'low';
  date?: Date;
  status: string;
  technician: string;
  location: string;
}

export interface InterventionBase {
  id: number;
  title: string;
  description?: string;
  equipment: string;
  equipmentId?: number;
  priority: 'high' | 'medium' | 'low';
  status: string;
  date: Date;
  technician: string;
  location: string;
  notes?: string;
}

export type InterventionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
