
export interface Intervention {
  id: string | number;
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  priority?: string;
  equipment?: {
    id: number;
    name: string;
    serialNumber?: string;
    model?: string;
  };
  partsUsed?: {
    id: number;
    name: string;
    quantity: number;
    unitPrice?: number;
  }[];
  notes?: string;
  _isOffline?: boolean;
  // Additional properties needed by components
  date?: Date;
  location?: string;
  technician?: string;
  scheduledDuration?: number;
  duration?: number;
}

// Form values interface for new interventions
export interface InterventionFormValues {
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  priority?: string;
  equipment?: string | {
    id: number;
    name: string;
    serialNumber?: string;
    model?: string;
  };
  notes?: string;
  location?: string;
  technician?: string;
  scheduledDuration?: number;
}
