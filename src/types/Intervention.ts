
export interface Intervention {
  id: number;
  title: string;
  description?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  date: string;
  time?: string;
  duration?: number;
  scheduledDuration: number;
  equipment: string;
  equipmentId: number;
  location: string;
  technician: string;
  observations?: string;
  partsUsed?: Array<{
    partId: number;
    name: string;
    quantity: number;
  }>;
}

export interface InterventionFormValues {
  title: string;
  description?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  date: string;
  time?: string;
  scheduledDuration: number;
  equipmentId: number;
  location: string;
  technician: string;
}
