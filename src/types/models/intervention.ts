
import { BaseEntity, TimestampFields } from './common';

/**
 * Intervention status type
 */
export type InterventionStatus = 'scheduled' | 'in-progress' | 'completed' | 'canceled';

/**
 * Intervention priority type
 */
export type InterventionPriority = 'low' | 'medium' | 'high';

/**
 * Base interface for a part used in an intervention
 */
export interface PartUsed {
  id: number;
  name: string;
  quantity: number;
}

/**
 * Intervention entity interface
 */
export interface Intervention extends BaseEntity, TimestampFields {
  id: number;
  title: string;
  equipment: string;
  equipmentId: number;
  description?: string;
  status: InterventionStatus;
  priority: InterventionPriority;
  date: Date;
  scheduledDuration?: number;
  duration?: number;
  technician: string;
  location: string;
  notes?: string;
  partsUsed?: PartUsed[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  ownerId?: string;
}

/**
 * Intervention form values interface
 */
export interface InterventionFormValues {
  title: string;
  equipment: string;
  equipmentId: number;
  equipment_id?: number; // For compatibility with API
  location: string;
  priority: InterventionPriority;
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

/**
 * Intervention database model interface
 */
export interface InterventionDB {
  id: number;
  title: string;
  description?: string;
  equipment: string;
  equipment_id: number;
  location: string;
  date: string;
  status: string;
  priority: string;
  technician: string;
  duration?: number;
  scheduled_duration?: number;
  notes?: string;
  parts_used?: any;
  coordinates?: any;
  created_at: string;
  updated_at: string;
  owner_id?: string;
}

/**
 * Intervention report data interface
 */
export interface InterventionReportData {
  duration: number;
  notes: string;
  partsUsed: PartUsed[];
}
