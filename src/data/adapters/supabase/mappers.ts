
import { Equipment } from '@/data/models/equipment';

/**
 * Mappers pour convertir entre les formats de base de données et les modèles internes
 */
export const mapDbToEquipment = (item: any): Equipment => ({
  id: item.id,
  name: item.name,
  model: item.model,
  manufacturer: item.manufacturer,
  year: item.year,
  serialNumber: item.serial_number,
  purchaseDate: item.purchase_date ? new Date(item.purchase_date) : undefined,
  location: item.location,
  status: item.status,
  type: item.type,
  category: item.category,
  image: item.image,
  notes: item.notes
});

export const mapEquipmentToDb = (equipment: Omit<Equipment, 'id'>) => ({
  name: equipment.name,
  model: equipment.model,
  manufacturer: equipment.manufacturer,
  year: equipment.year,
  serial_number: equipment.serialNumber,
  purchase_date: equipment.purchaseDate,
  location: equipment.location,
  status: equipment.status,
  type: equipment.type,
  category: equipment.category,
  image: equipment.image,
  notes: equipment.notes
});
