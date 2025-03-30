
import { EquipmentItem, RawEquipmentData } from '../types/equipmentTypes';
import { validateEquipmentStatus } from '@/utils/typeGuards';
import { assertIsString, assertIsObject, assertType } from '@/utils/typeAssertions';

/**
 * Format due date to a user-friendly string
 */
export const formatDueDate = (dueDate: Date): string => {
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Overdue';
  } else if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays <= 7) {
    return `In ${diffDays} days`;
  } else if (diffDays <= 30) {
    return `In ${Math.ceil(diffDays / 7)} weeks`;
  } else {
    return `In ${Math.ceil(diffDays / 30)} months`;
  }
};

/**
 * Transform raw equipment data to our interface format
 */
export const transformEquipmentData = (
  equipmentItems: RawEquipmentData[], 
  maintenanceMap: Map<string, { type: string; due: string }>,
  simpleDueMap: Map<string, string>
): EquipmentItem[] => {
  return equipmentItems.map(item => {
    // Validation de l'objet item
    assertIsObject(item);
    
    // Default image based on equipment type
    let defaultImage = 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop';
    
    // Validation du type d'équipement
    const itemType = assertType<string | undefined>(
      item.type, 
      (v): v is string | undefined => typeof v === 'string' || v === undefined,
      "Equipment type must be a string or undefined"
    );
    
    if (itemType?.toLowerCase().includes('combine') || itemType?.toLowerCase().includes('harvester')) {
      defaultImage = 'https://images.unsplash.com/photo-1599033329459-cc8c31c7eb6c?q=80&w=500&auto=format&fit=crop';
    }

    const itemId = assertIsString(item.id.toString());
    
    return {
      id: item.id,
      name: item.name || `${item.model || 'Unknown'} Equipment`,
      type: itemType || 'Unknown',
      status: validateEquipmentStatus(item.status),
      image: item.image || defaultImage,
      usage: {
        hours: item.usage_hours || 0,
        target: item.usage_target || 500
      },
      nextService: maintenanceMap.get(itemId) || {
        type: 'Regular Maintenance',
        due: 'Not scheduled'
      },
      nextMaintenance: simpleDueMap.get(itemId) || null
    };
  });
};
