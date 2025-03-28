
export interface Equipment {
  id: string | number;
  name: string;
  type: string;
  category: string;
  manufacturer: string;
  model: string;
  year: number | null;
  serialNumber: string | null;
  purchaseDate?: Date;
  status: string;
  location: string;
  notes: string;
  image?: string;
  owner_id?: string;
}

export interface EquipmentFilter {
  search?: string;
  type?: string;
  category?: string;
  manufacturer?: string;
  status?: string;
  location?: string;
  year?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
