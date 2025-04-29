
export interface Intervention {
  id: number;
  title: string;
  equipment: string;
  equipmentId: number;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'scheduled' | 'in-progress' | 'completed' | 'canceled';
  priority: 'high' | 'medium' | 'low';
  date: Date;
  duration?: number;
  scheduledDuration?: number;
  technician: string;
  description: string;
  partsUsed: Array<{ id: number; name: string; quantity: number; }>;
  notes: string;
}

export interface InterventionFormValues {
  title: string;
  equipment: string;
  equipmentId: number;
  location: string;
  priority: 'high' | 'medium' | 'low';
  date: Date;
  scheduledDuration: number;
  technician: string;
  description: string;
  notes: string;
}
