
export interface Equipment {
  id: number;
  name: string;
  model?: string;
  manufacturer?: string;
  year?: number;
  serialNumber?: string;
  purchaseDate?: Date | string;
  location?: string;
  status?: 'operational' | 'maintenance' | 'repair' | 'inactive';
  type?: string;
  category?: string;
  image?: string;
  notes?: string;
  owner_id?: string;
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
}

export interface EquipmentStats {
  total: number;
  operational: number;
  maintenance: number;
  repair: number;
  inactive: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
}

export interface FilterOptions {
  status: string[];
  type: string[];
  category: string[];
  manufacturer: string[];
  location: string[];
  yearRange: { min: number; max: number };
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}
