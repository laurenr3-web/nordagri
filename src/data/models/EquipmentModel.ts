
import { Equipment, EquipmentFilter, EquipmentStats, FilterOptions } from '@/services/supabase/equipment/types';

// Re-export types with improved naming for clarity
export type { 
  Equipment as EquipmentModel,
  EquipmentFilter as EquipmentFilterModel,
  EquipmentStats as EquipmentStatsModel,
  FilterOptions as EquipmentFilterOptionsModel
};

// Add validation functions
export function isValidEquipment(data: unknown): data is Equipment {
  return (
    typeof data === 'object' && 
    data !== null &&
    'id' in data && 
    typeof (data as any).id === 'number' &&
    'name' in data && 
    typeof (data as any).name === 'string'
  );
}
