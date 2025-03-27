
import { Equipment } from './types';

// Helper function to map database fields to Equipment interface
export function mapEquipmentFromDatabase(item: any): Equipment {
  return {
    id: item.id,
    name: item.name,
    model: item.model,
    manufacturer: item.manufacturer,
    year: item.year,
    serialNumber: item.serialnumber, // Fixed: using the actual column name from DB
    purchaseDate: item.purchase_date ? new Date(item.purchase_date) : undefined,
    purchasePrice: item.purchase_price,
    status: item.status || 'operational',
    location: item.current_location,
    lastMaintenance: item.last_maintenance ? new Date(item.last_maintenance) : undefined,
    nextMaintenance: item.next_maintenance ? new Date(item.next_maintenance) : undefined,
    notes: item.notes,
    type: item.type || 'Tractor',
    category: item.category || 'Heavy Equipment',
    image: item.image || 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop' // Default image
  };
}

// Helper function to map Equipment interface to database fields
export function mapEquipmentToDatabase(equipment: Omit<Equipment, 'id' | 'image'> & { id?: number }): any {
  return {
    id: equipment.id,
    name: equipment.name,
    model: equipment.model,
    manufacturer: equipment.manufacturer,
    year: equipment.year,
    serialnumber: equipment.serialNumber, // Fixed: using the actual column name in DB
    purchase_date: equipment.purchaseDate?.toISOString(),
    purchase_price: equipment.purchasePrice,
    status: equipment.status || 'operational',
    current_location: equipment.location,
    last_maintenance: equipment.lastMaintenance?.toISOString(),
    next_maintenance: equipment.nextMaintenance?.toISOString(),
    notes: equipment.notes,
    type: equipment.type,
    category: equipment.category
  };
}
