
import { supabase } from '@/integrations/supabase/client';
import { Equipment, EquipmentFilter } from '@/data/models/equipment';
import { mapDbToEquipment, mapEquipmentToDb } from './mappers';
import { convertDatesToISOStrings } from './utils';
import { applyFilters } from './filters';

// Define type for database equipment record
type EquipmentRecord = {
  id: number;
  name: string;
  model?: string;
  manufacturer?: string;
  year?: number;
  serial_number?: string;
  purchase_date?: string;
  location?: string;
  status?: string;
  type?: string;
  category?: string;
  image?: string;
  notes?: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * Adaptateur Supabase pour les équipements
 */
export const equipmentAdapter = {
  async getAll(filters?: EquipmentFilter): Promise<Equipment[]> {
    try {
      let query = supabase.from('equipment').select('*');
      
      // Appliquer les filtres à la requête
      query = applyFilters(query, filters);
      
      // Exécuter la requête
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      
      return data.map(mapDbToEquipment);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }
  },
  
  async getById(id: number): Promise<Equipment | null> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }
      
      return mapDbToEquipment(data);
    } catch (error) {
      console.error(`Error fetching equipment with ID ${id}:`, error);
      throw error;
    }
  },
  
  async add(equipment: Omit<Equipment, 'id'>): Promise<Equipment> {
    try {
      // Get the current user session
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Prepare equipment data with dates converted to ISO strings
      const equipmentData = mapEquipmentToDb(equipment);
      const dbEquipment = convertDatesToISOStrings({
        ...equipmentData,
        owner_id: sessionData.session?.user.id,
        created_at: new Date(),
        updated_at: new Date()
      }) as EquipmentRecord;
      
      // Insert the equipment
      const { data, error } = await supabase
        .from('equipment')
        .insert(dbEquipment)
        .select()
        .single();
      
      if (error) throw error;
      
      return mapDbToEquipment(data);
    } catch (error) {
      console.error('Error adding equipment:', error);
      throw error;
    }
  },
  
  async update(equipment: Equipment): Promise<Equipment> {
    try {
      // Prepare equipment data with dates converted to ISO strings
      const equipmentData = mapEquipmentToDb(equipment);
      const dbEquipment = convertDatesToISOStrings({
        ...equipmentData,
        updated_at: new Date()
      }) as EquipmentRecord;
      
      // Update the equipment
      const { data, error } = await supabase
        .from('equipment')
        .update(dbEquipment)
        .eq('id', equipment.id)
        .select()
        .single();
      
      if (error) throw error;
      
      return mapDbToEquipment(data);
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
  },
  
  async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting equipment with ID ${id}:`, error);
      throw error;
    }
  }
};
