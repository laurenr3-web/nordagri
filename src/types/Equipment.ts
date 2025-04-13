
// Re-export from the new centralized models
export { 
  EquipmentStatus,
  Equipment,
  EquipmentFilter,
  EquipmentDB,
  EquipmentFormValues
} from './models/equipment';

import { Equipment, EquipmentDB } from './models/equipment';
import { convertToApi, convertFromApi, safeEnumValue } from '@/utils/typeTransformers';

/**
 * Convert equipment from database format to application format
 * @deprecated Use convertFromApi from typeTransformers.ts instead
 */
export function mapEquipmentFromDB(dbEquipment: EquipmentDB): Equipment {
  return {
    id: dbEquipment.id,
    name: dbEquipment.name,
    type: dbEquipment.type || '',
    model: dbEquipment.model,
    manufacturer: dbEquipment.manufacturer,
    category: dbEquipment.category,
    status: safeEnumValue(
      dbEquipment.status, 
      ['operational', 'maintenance', 'repair', 'inactive'] as const,
      'operational'
    ),
    location: dbEquipment.location,
    purchaseDate: dbEquipment.purchase_date,
    serialNumber: dbEquipment.serial_number,
    image: dbEquipment.image,
    notes: dbEquipment.notes,
    ownerId: dbEquipment.owner_id,
    year: dbEquipment.year
  };
}

/**
 * Convert equipment from application format to database format
 * @deprecated Use convertToApi from typeTransformers.ts instead
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
    year: equipment.year
  };
}
