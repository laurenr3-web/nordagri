
export interface Intervention {
  id: number;
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: "completed" | "scheduled" | "in-progress" | "canceled";
  priority: "high" | "medium" | "low";
  equipment: string;
  partsUsed?: {
    id?: number;
    partId?: number;
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
  equipmentId?: number; 
  coordinates?: { lat: number; lng: number; };
}

// Form values interface for new interventions
export interface InterventionFormValues {
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: "completed" | "scheduled" | "in-progress" | "canceled";
  priority: "high" | "medium" | "low";
  equipment: string;
  equipmentId: number;
  notes?: string;
  location?: string;
  technician?: string;
  scheduledDuration?: number;
  date: Date;
}
