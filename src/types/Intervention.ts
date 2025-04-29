
export interface Intervention {
  id: number;
  title: string;
  description?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  date: Date | string;
  time?: string;
  duration?: number;
  scheduledDuration: number;
  equipment: string;
  equipmentId: number;
  location: string;
  technician: string;
  observations?: string;
  notes?: string;
  partsUsed?: Array<{
    partId: number;
    name: string;
    quantity: number;
  }>;
}

export interface InterventionFormValues {
  title: string;
  description?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  date: Date | string;
  time?: string;
  scheduledDuration: number;
  equipmentId: number;
  location: string;
  technician: string;
  notes?: string;
}
