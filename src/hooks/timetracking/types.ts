
// Types for time tracking functionality
export interface Activity {
  id: number;
  taskName: string;
  equipmentId: number;
  equipment: string;
  fieldId: number;
  field: string;
  fieldSize: number;
  status: 'pending' | 'active' | 'paused' | 'completed';
  duration: number;
  createdAt: Date;
  location?: {
    lat: number;
    lng: number;
  };
  coordinates?: {  // Keep for backward compatibility
    lat: number;
    lng: number;
  };
  description?: string;
  notes?: string;
}

export interface Equipment {
  id: number;
  name: string;
  type: string;
  status: 'available' | 'in-use' | 'maintenance';
}

export interface ActiveTracking {
  activityId: number;
  equipment: string;
  field: string;
  status: 'active' | 'paused';
  startTime: Date;
  duration: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}
