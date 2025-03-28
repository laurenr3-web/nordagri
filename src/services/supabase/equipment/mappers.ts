
import { Equipment } from './types';

/**
 * Maps database equipment record to frontend Equipment object
 */
export const mapEquipmentFromDatabase = (record: any): Equipment => {
  return {
    id: record.id,
    name: record.name,
    type: record.type || '',
    category: record.category || '',
    manufacturer: record.manufacturer || '',
    model: record.model || '',
    year: record.year || null,
    serialNumber: record.serial_number || null,
    purchaseDate: record.acquisition_date ? new Date(record.acquisition_date) : undefined,
    status: record.status || 'operational',
    location: record.location || '',
    notes: record.notes || '',
    image: record.image || '',
    owner_id: record.owner_id || null
  };
};

/**
 * Maps frontend Equipment object to database record format
 */
export const mapEquipmentToDatabase = (equipment: Omit<Equipment, 'id' | 'image'>): any => {
  return {
    name: equipment.name,
    type: equipment.type,
    category: equipment.category,
    manufacturer: equipment.manufacturer,
    model: equipment.model || null,
    year: equipment.year || null,
    serial_number: equipment.serialNumber || null,
    acquisition_date: equipment.purchaseDate,
    status: equipment.status || 'operational',
    location: equipment.location || null,
    notes: equipment.notes || null,
    owner_id: equipment.owner_id || null
  };
};
