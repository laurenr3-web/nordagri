
import { BaseEntity, TimestampFields } from './common';

/**
 * Equipment status type
 */
export type EquipmentStatus = 'operational' | 'maintenance' | 'repair' | 'inactive';

/**
 * Base equipment properties
 */
export interface EquipmentBase {
  name: string;
  type: string;
  manufacturer?: string;
  model?: string;
  year?: number;
  serialNumber?: string;
  status: EquipmentStatus;
  location?: string;
  category?: string;
  purchaseDate?: string | null;
  image?: string | null;
  notes?: string;
}

/**
 * Complete equipment entity interface
 */
export interface Equipment extends BaseEntity, TimestampFields, EquipmentBase {
  usageHours?: number;
  maintenanceCount?: number;
  nextMaintenanceDate?: string;
  farmId?: string;
  ownerId?: string;
}

/**
 * Equipment form values interface
 */
export interface EquipmentFormValues {
  name: string;
  type: string;
  manufacturer?: string;
  model?: string;
  year?: string;
  serialNumber?: string;
  status: EquipmentStatus;
  location?: string;
  category?: string;
  purchaseDate?: Date | null;
  image?: string | null;
  notes?: string;
}

/**
 * Equipment database model interface aligned with Supabase schema
 */
export interface EquipmentDB {
  id: number;
  name: string;
  type: string | null;
  manufacturer: string | null;
  model: string | null;
  year: number | null;
  serial_number: string | null;
  status: string | null;
  location: string | null;
  category: string | null;
  purchase_date: string | null;
  image: string | null;
  notes: string | null;
  owner_id: string | null;
  farm_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Equipment filter interface
 */
export interface EquipmentFilter {
  search?: string;
  status?: EquipmentStatus[];
  type?: string[];
  category?: string[];
  manufacturer?: string[];
  location?: string[];
  yearMin?: number;
  yearMax?: number;
}

