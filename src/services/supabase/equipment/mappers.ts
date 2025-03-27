
import { Equipment } from './types';

// Helper function to map database fields to Equipment interface
export function mapEquipmentFromDatabase(item: any): Equipment {
  return {
    id: item.id,
    name: item.name,
    model: item.model,
    manufacturer: item.manufacturer,
    year: item.year,
    serialNumber: item.serial_number, // Using the actual column name from DB
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

// Helper function to safely get an ISO string from a date value
function safeISOString(dateValue: any): string | null {
  if (!dateValue) return null;
  
  // Skip conversion for display-only values like 'N/A'
  if (typeof dateValue === 'string' && dateValue === 'N/A') return null;
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue.toISOString();
  }
  
  // If it's a date picker object
  if (typeof dateValue === 'object' && dateValue._type === 'Date' && dateValue.value) {
    // With ISO string
    if (dateValue.value.iso) {
      return dateValue.value.iso;
    }
    // With numeric value
    if (dateValue.value.value) {
      return new Date(dateValue.value.value).toISOString();
    }
  }
  
  // Try to convert string to date
  if (typeof dateValue === 'string') {
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch (e) {
      console.log('Error converting string to date:', dateValue);
    }
  }
  
  return null;
}

// Helper function to map Equipment interface to database fields
export function mapEquipmentToDatabase(equipment: Omit<Equipment, 'id' | 'image'> & { id?: number }): any {
  return {
    id: equipment.id,
    name: equipment.name,
    model: equipment.model,
    manufacturer: equipment.manufacturer,
    year: equipment.year,
    serial_number: equipment.serialNumber, // Using the actual column name in DB
    purchase_date: safeISOString(equipment.purchaseDate),
    purchase_price: equipment.purchasePrice,
    status: equipment.status || 'operational',
    current_location: equipment.location,
    last_maintenance: safeISOString(equipment.lastMaintenance),
    next_maintenance: safeISOString(equipment.nextMaintenance),
    notes: equipment.notes,
    type: equipment.type,
    category: equipment.category
  };
}
