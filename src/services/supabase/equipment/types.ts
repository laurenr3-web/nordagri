export interface Equipment {
  id: number;
  name: string;
  model?: string;
  manufacturer?: string;
  year?: number;
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  status?: string;
  location?: string;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  notes?: string;
  image?: string; // Client-side property only, not stored in database
  type?: string;
  category?: string;
  owner_id?: string; // Added owner_id field
}

export interface EquipmentFilter {
  search?: string;
  status?: string[];
  type?: string[];
  category?: string[];
  manufacturer?: string[];
  location?: string[];
  yearMin?: number;
  yearMax?: number;
  nextMaintenanceBefore?: Date;
}

export interface EquipmentStats {
  total: number;
  operational: number;
  maintenance: number;
  repair: number;
  byType: Record<string, number>;
  byManufacturer: Record<string, number>;
}

export interface FilterOptions {
  manufacturers: string[];
  types: string[];
  categories: string[];
  statuses: string[];
  locations: string[];
}
