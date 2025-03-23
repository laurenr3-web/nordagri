
// Types for the OptiField feature

export interface FieldPosition {
  lat: number;
  lng: number;
}

export interface Field {
  id: string;
  name: string;
  area: number; // in hectares
  boundaries: FieldPosition[]; // Polygon points
}

export interface Equipment {
  id: string;
  name: string;
  type: 'tractor' | 'implement' | 'harvester' | 'other';
  status: 'active' | 'inactive' | 'maintenance';
  currentLocation?: FieldPosition;
  currentField?: string; // Field ID
}

export interface EquipmentPairing {
  id: string;
  tractorId: string;
  implementId?: string;
  startTime: Date;
  endTime?: Date;
}

export interface TrackingSession {
  id: string;
  equipmentPairingId: string;
  fieldId?: string;
  activityType?: ActivityType;
  startTime: Date;
  endTime?: Date;
  path: FieldPosition[];
  status: 'active' | 'paused' | 'completed';
  totalDuration: number; // in minutes
  productiveTime: number; // in minutes
}

export type ActivityType = 
  | 'plowing' 
  | 'harrowing' 
  | 'seeding' 
  | 'fertilizing'
  | 'spraying'
  | 'harvesting'
  | 'transport'
  | 'maintenance'
  | 'other';

export interface ActivitySummary {
  equipmentName: string;
  fieldName?: string;
  activityType?: ActivityType;
  duration: number; // in minutes
  date: Date;
  efficiency: number; // percentage
}
