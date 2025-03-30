
import { Equipment, EquipmentFilter } from '@/data/models/equipment';
import { supabaseAdapter } from '@/data/adapters/supabaseAdapter';

export const equipmentRepository = {
  /**
   * Récupère tous les équipements correspondant aux filtres
   */
  async getAll(filters?: EquipmentFilter): Promise<Equipment[]> {
    return supabaseAdapter.equipment.getAll(filters);
  },
  
  /**
   * Récupère un équipement par son ID
   */
  async getById(id: number): Promise<Equipment | null> {
    return supabaseAdapter.equipment.getById(id);
  },
  
  /**
   * Ajoute un nouvel équipement
   */
  async add(equipment: Omit<Equipment, 'id'>): Promise<Equipment> {
    return supabaseAdapter.equipment.add(equipment);
  },
  
  /**
   * Met à jour un équipement existant
   */
  async update(equipment: Equipment): Promise<Equipment> {
    return supabaseAdapter.equipment.update(equipment);
  },
  
  /**
   * Supprime un équipement
   */
  async delete(id: number): Promise<void> {
    return supabaseAdapter.equipment.delete(id);
  }
};
