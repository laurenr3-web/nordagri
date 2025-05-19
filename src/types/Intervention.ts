
export interface Intervention {
  id: number;  // Changed from string | number to just number
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: "completed" | "scheduled" | "in-progress" | "canceled"; // Using string literals instead of generic string
  priority: "high" | "medium" | "low"; // Using string literals instead of generic string
  equipment: string; // Changed from object type to string to match actual usage
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
