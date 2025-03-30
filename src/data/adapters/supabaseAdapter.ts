
import { Equipment, EquipmentFilter } from '@/data/models/equipment';
import { equipmentAdapter } from './supabase/equipmentAdapter';

/**
 * Adaptateur Supabase pour les équipements
 */
export const supabaseAdapter = {
  equipment: equipmentAdapter
};
