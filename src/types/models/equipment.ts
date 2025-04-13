
import { BaseEntity, TimestampFields } from './common';

/**
 * Equipment status type
 */
export type EquipmentStatus = 'operational' | 'maintenance' | 'repair' | 'inactive';

/**
 * Equipment entity interface
 */
export interface Equipment extends BaseEntity, TimestampFields {
  id: number;
  name: string;
  type: string;
  model?: string;
  manufacturer?: string;
  category?: string;
  status: EquipmentStatus;
  location?: string;
  purchaseDate?: string | null;
  serialNumber?: string | null;
  image?: string | null;
  usageHours?: number;
  notes?: string;
  lastMaintenanceDate?: string | null;
  nextMaintenanceDate?: string | null;
  maintenancesCompleted?: number;
  maintenancesPending?: number;
  ownerId?: string;
  year?: number;
}

/**
 * Equipment filter interface
 */
export interface EquipmentFilter {
  category?: string;
  manufacturer?: string;
  status?: EquipmentStatus;
  searchTerm?: string;
  type?: string[];
  yearMin?: number;
  yearMax?: number;
}

/**
 * Equipment database model interface
 */
export interface EquipmentDB {
  id: number;
  name: string;
  type?: string;
  model?: string;
  manufacturer?: string;
  category?: string;
  status?: string;
  location?: string;
  purchase_date?: string;
  serial_number?: string;
  image?: string;
  notes?: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  year?: number;
  farm_id?: string;
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
  purchaseDate?: Date;
  notes?: string;
  image?: string;
}
