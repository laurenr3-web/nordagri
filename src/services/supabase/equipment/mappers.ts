
import { Equipment } from './types';

/**
 * Maps database equipment record to frontend Equipment object
 */
export const mapEquipmentFromDatabase = (record: any): Equipment => {
  // Extract metadata fields or use defaults
  const metadata = record.metadata || {};
  
  return {
    id: record.id,
    name: record.name,
    type: record.type || '',
    category: metadata.category || '',  // Get category from metadata
    manufacturer: metadata.manufacturer || '',  // Get manufacturer from metadata
    model: metadata.model || '',
    year: metadata.year || null,
    serialNumber: record.serial_number || null,
    purchaseDate: record.acquisition_date ? new Date(record.acquisition_date) : undefined,
    status: record.status || 'operational',
    location: metadata.location || '',  // Get location from metadata
    notes: record.notes || '',
    image: metadata.image || '',
    owner_id: record.owner_id || null,
    metadata: record.metadata || {},
    current_hours: record.current_hours || 0,
    acquisition_date: record.acquisition_date,
    created_at: record.created_at,
    updated_at: record.updated_at,
    // Add a placeholder for lastMaintenance which will be populated elsewhere
    lastMaintenance: undefined
  };
};

/**
 * Maps frontend Equipment object to database record format
 */
export const mapEquipmentToDatabase = (equipment: Omit<Equipment, 'id' | 'image'>): any => {
  // Create a base mapping object
  const dbRecord = {
    name: equipment.name,
    type: equipment.type,
    model: equipment.model || null,
    serial_number: equipment.serialNumber || null,
    acquisition_date: equipment.purchaseDate,
    status: equipment.status || 'operational',
    notes: equipment.notes || null,
    owner_id: equipment.owner_id || null,
    metadata: equipment.metadata || {},
    current_hours: equipment.current_hours || 0
  };

  // Add fields to metadata that are not direct columns in the database
  const metadata = dbRecord.metadata as Record<string, any>;
  
  if (equipment.manufacturer) {
    metadata.manufacturer = equipment.manufacturer;
  }
  
  if (equipment.category) {
    metadata.category = equipment.category;
  }
  
  if (equipment.location) {
    metadata.location = equipment.location;
  }
  
  if (equipment.year) {
    metadata.year = equipment.year;
  }
  
  return dbRecord;
};
