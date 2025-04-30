
import { RawEquipmentData, EquipmentItem } from '../types/equipmentTypes';
import { differenceInDays, format } from 'date-fns';

/**
 * Format date for equipment maintenance date displays
 */
export function formatDueDate(date: Date): string {
  const now = new Date();
  const days = differenceInDays(date, now);
  
  if (days < 0) {
    return 'En retard';
  } else if (days === 0) {
    return "Aujourd'hui";
  } else if (days === 1) {
    return 'Demain';
  } else if (days <= 30) {
    return `Dans ${days} jours`;
  } else {
    return 'À jour';
  }
}

/**
 * Transform raw equipment data into the format needed for display
 */
export function transformEquipmentData(
  equipmentItems: RawEquipmentData[], 
  maintenanceMap: Map<string, { type: string; due: string }>,
  simpleDueMap: Map<string, string>
): EquipmentItem[] {
  return equipmentItems.map(item => {
    // Get equipment ID as string
    const equipmentId = item.id.toString();
    
    // Get maintenance info for this equipment
    const nextService = maintenanceMap.get(equipmentId) || 
      { type: 'Maintenance régulière', due: 'À jour' };
    
    // Get usage data with defaults
    const usageHours = item.usage_hours || 0;
    const usageTarget = item.usage_target || 500;
    
    return {
      id: item.id,
      name: item.name || `Equipment #${item.id}`,
      type: item.type || 'Unknown',
      status: validateEquipmentStatus(item.status),
      image: item.image || 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop',
      usage: {
        hours: usageHours,
        target: usageTarget
      },
      nextService: nextService,
      nextMaintenance: simpleDueMap.get(equipmentId) || null
    };
  });
}

/**
 * Validate that equipment status is one of the allowed values
 */
export function validateEquipmentStatus(status: string | undefined): 'operational' | 'maintenance' | 'repair' | 'inactive' {
  const validStatuses = ['operational', 'maintenance', 'repair', 'inactive'];
  
  if (status && validStatuses.includes(status)) {
    return status as 'operational' | 'maintenance' | 'repair' | 'inactive';
  }
  
  return 'operational'; // Default fallback
}
