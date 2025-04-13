
export type EquipmentStatus = 'operational' | 'maintenance' | 'repair' | 'inactive';

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
  year?: number; // Added year property
}

export interface EquipmentFilter {
  category?: string;
  manufacturer?: string;
  status?: EquipmentStatus;
  searchTerm?: string;
}

export type EquipmentDB = {
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
 * Convert equipment from database format to application format
 */
export function mapEquipmentFromDB(dbEquipment: EquipmentDB): Equipment {
  return {
    id: dbEquipment.id,
    name: dbEquipment.name,
    type: dbEquipment.type || '',
    model: dbEquipment.model,
    manufacturer: dbEquipment.manufacturer,
    category: dbEquipment.category,
    status: (dbEquipment.status as EquipmentStatus) || 'operational',
    location: dbEquipment.location,
    purchaseDate: dbEquipment.purchase_date,
    serialNumber: dbEquipment.serial_number,
    image: dbEquipment.image,
    notes: dbEquipment.notes,
    ownerId: dbEquipment.owner_id,
    year: dbEquipment.year // Added year mapping
  };
}

/**
 * Convert equipment from application format to database format
 */
export function mapEquipmentToDB(equipment: Partial<Equipment>): Partial<EquipmentDB> {
  return {
    id: equipment.id,
    name: equipment.name,
    type: equipment.type,
    model: equipment.model,
    manufacturer: equipment.manufacturer,
    category: equipment.category,
    status: equipment.status,
    location: equipment.location,
    purchase_date: equipment.purchaseDate,
    serial_number: equipment.serialNumber,
    image: equipment.image,
    notes: equipment.notes,
    owner_id: equipment.ownerId,
    year: equipment.year // Added year mapping
  };
}
