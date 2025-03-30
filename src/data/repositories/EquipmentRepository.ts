
import { supabase } from '@/integrations/supabase/client';
import { 
  Equipment,
  EquipmentFilter,
  mapEquipmentFromDatabase,
  mapEquipmentToDatabase,
  applyFilters
} from '@/services/supabase/equipment';
import { ensureNumberId } from '@/utils/typeGuards';

/**
 * Repository for equipment data access
 */
export class EquipmentRepository {
  /**
   * Get all equipment
   */
  async getAll(): Promise<Equipment[]> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data.map(mapEquipmentFromDatabase);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }
  }

  /**
   * Get equipment by ID
   */
  async getById(id: string | number): Promise<Equipment | null> {
    try {
      const numericId = ensureNumberId(id);
      
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', numericId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }
      
      return mapEquipmentFromDatabase(data);
    } catch (error) {
      console.error(`Error fetching equipment with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search equipment with filters
   */
  async search(filters: EquipmentFilter): Promise<Equipment[]> {
    try {
      let query = supabase.from('equipment').select('*');
      
      // Apply filters
      query = applyFilters(query, filters);
      
      // Execute query
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      
      return data.map(mapEquipmentFromDatabase);
    } catch (error) {
      console.error('Error searching equipment:', error);
      throw error;
    }
  }

  /**
   * Add new equipment
   */
  async add(equipment: Omit<Equipment, 'id'>): Promise<Equipment> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Map equipment to database format
      const dbEquipment = {
        ...mapEquipmentToDatabase(equipment),
        owner_id: sessionData.session?.user.id
      };
      
      const { data, error } = await supabase
        .from('equipment')
        .insert(dbEquipment)
        .select()
        .single();
      
      if (error) throw error;
      
      return mapEquipmentFromDatabase(data);
    } catch (error) {
      console.error('Error adding equipment:', error);
      throw error;
    }
  }

  /**
   * Update existing equipment
   */
  async update(equipment: Equipment): Promise<Equipment> {
    try {
      const dbEquipment = mapEquipmentToDatabase(equipment);
      
      const { data, error } = await supabase
        .from('equipment')
        .update(dbEquipment)
        .eq('id', equipment.id)
        .select()
        .single();
      
      if (error) throw error;
      
      return mapEquipmentFromDatabase(data);
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
  }

  /**
   * Delete equipment
   */
  async delete(id: string | number): Promise<void> {
    try {
      const numericId = ensureNumberId(id);
      
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', numericId);
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting equipment with ID ${id}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const equipmentRepository = new EquipmentRepository();
