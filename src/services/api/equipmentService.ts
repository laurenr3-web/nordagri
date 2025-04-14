
// Make sure to fix the issue with the missing name field when creating equipment
import { supabase } from '@/integrations/supabase/client';
import { EquipmentFilter } from '@/types/Equipment';
import { ensureNumberId } from '@/utils/typeGuards';

export interface Equipment {
  id: number;
  name: string;
  type?: string;
  category?: string;
  model?: string;
  manufacturer?: string;
  serial_number?: string;
  location?: string;
  purchase_date?: string;
  status?: string;
  notes?: string;
  image?: string;
  year?: number;
}

export const equipmentService = {
  async getEquipment(filters?: EquipmentFilter): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching equipment data:', error);
      throw error;
    }
    
    return data || [];
  },
  
  async getEquipmentById(id: number): Promise<Equipment> {
    // Ensure id is a number
    const numericId = ensureNumberId(id);
    
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', numericId)
      .single();
    
    if (error) {
      console.error(`Error fetching equipment with id ${id}:`, error);
      throw error;
    }
    
    return data;
  },
  
  async createEquipment(equipmentData: Omit<Equipment, 'id'>): Promise<Equipment> {
    const { data, error } = await supabase
      .from('equipment')
      .insert(equipmentData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating equipment:', error);
      throw error;
    }
    
    return data;
  },
  
  async updateEquipment(id: number, equipmentData: Partial<Equipment>): Promise<Equipment> {
    // Ensure id is a number
    const numericId = ensureNumberId(id);
    
    const { data, error } = await supabase
      .from('equipment')
      .update(equipmentData)
      .eq('id', numericId)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating equipment with id ${id}:`, error);
      throw error;
    }
    
    return data;
  },
  
  async deleteEquipment(id: number): Promise<void> {
    // Ensure id is a number
    const numericId = ensureNumberId(id);
    
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', numericId);
    
    if (error) {
      console.error(`Error deleting equipment with id ${id}:`, error);
      throw error;
    }
  },
  
  async getEquipmentCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('category')
      .not('category', 'is', null);
    
    if (error) {
      console.error('Error fetching equipment categories:', error);
      throw error;
    }
    
    const categories = data
      .map(item => item.category)
      .filter((value, index, self) => value && self.indexOf(value) === index);
    
    return categories;
  },
  
  async getEquipmentByCategory(category: string): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('category', category);
    
    if (error) {
      console.error(`Error fetching equipment with category ${category}:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  async createEquipmentWithMetadata(equipment: Omit<Equipment, 'id'>, userId: string): Promise<Equipment> {
    const now = new Date().toISOString();
    
    const equipmentWithMetadata = {
      ...equipment,
      owner_id: userId,
      created_at: now,
      updated_at: now,
    };
    
    const { data, error } = await supabase
      .from('equipment')
      .insert(equipmentWithMetadata)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating equipment with metadata:', error);
      throw error;
    }
    
    return data;
  }
};
