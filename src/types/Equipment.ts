
export type EquipmentStatus = 'operational' | 'maintenance' | 'repair' | 'decommissioned' | 'inactive' | string;

export interface Equipment {
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
}

export interface EquipmentFilter {
  category?: string;
  manufacturer?: string;
  status?: EquipmentStatus;
  searchTerm?: string;
}
