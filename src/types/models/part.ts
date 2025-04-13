
import { BaseEntity, TimestampFields } from './common';

/**
 * Part entity interface
 */
export interface Part extends BaseEntity, TimestampFields {
  id: number | string;
  name: string;
  partNumber: string;
  reference?: string;
  description?: string;
  category: string;
  manufacturer: string;
  compatibility: string[];
  compatibleWith?: string[] | string;
  stock: number;
  price: number;
  location: string;
  reorderPoint: number;
  inStock?: boolean;
  quantity?: number;
  minimumStock?: number;
  lastUsed?: Date | null;
  purchasePrice?: number;
  estimatedPrice?: number | null;
  isFromSearch?: boolean;
  imageUrl?: string | null;
  image: string;
}

/**
 * Part database model interface
 */
export interface PartDB {
  id: number | string;
  name: string;
  part_number: string;
  reference?: string;
  description?: string;
  category: string;
  manufacturer: string;
  supplier?: string;
  compatible_with: string[];
  quantity: number;
  unit_price: number;
  location?: string;
  reorder_threshold: number;
  last_ordered?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
}

/**
 * Part form values interface
 */
export interface PartFormValues {
  name: string;
  partNumber: string;
  category: string;
  manufacturer: string;
  price: string;
  stock: string;
  location?: string;
  reorderPoint: string;
  compatibility?: string;
  image?: string;
}

/**
 * Part technical information interface
 */
export interface PartTechnicalInfo {
  function: string;
  compatibleEquipment: string[];
  installation: string;
  symptoms: string;
  maintenance: string;
  alternatives?: string[];
  warnings?: string;
}
