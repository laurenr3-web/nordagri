import { supabase } from '@/integrations/supabase/client';
import { Equipment } from './types';
import { mapEquipmentToDatabase, mapEquipmentFromDatabase } from './mappers';

/**
 * Add a new equipment item to the database
 */
export async function addEquipment(equipment: Omit<Equipment, 'id'>): Promise<Equipment> {
  try {
    console.log('Adding equipment:', equipment);
    
    // Get the current user
    const { user } = await supabase.auth.getUser();
    
    // Map equipment to database format
    const dbEquipment = {
      ...mapEquipmentToDatabase(equipment),
      owner_id: user ? user.id : null
    };
    
    // Insert the equipment
    const { data, error } = await supabase
      .from('equipment')
      .insert(dbEquipment)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding equipment:', error.message);
      throw error;
    }
    
    console.log('Equipment added successfully:', data);
    return mapEquipmentFromDatabase(data);
  } catch (error) {
    console.error('Error in addEquipment:', error);
    throw error;
  }
}

/**
 * Update an existing equipment item in the database
 */
export async function updateEquipment(equipment: Equipment): Promise<Equipment> {
  try {
    console.log('Updating equipment:', equipment);
    
    // Map equipment to database format
    const dbEquipment = mapEquipmentToDatabase(equipment);
    
    // Update the equipment
    const { data, error } = await supabase
      .from('equipment')
      .update(dbEquipment)
      .eq('id', equipment.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating equipment:', error.message);
      throw error;
    }
    
    console.log('Equipment updated successfully:', data);
    return mapEquipmentFromDatabase(data);
  } catch (error) {
    console.error('Error in updateEquipment:', error);
    throw error;
  }
}

/**
 * Delete an equipment item from the database
 */
export async function deleteEquipment(id: number): Promise<void> {
  try {
    console.log('Deleting equipment with ID:', id);
    
    // Delete the equipment
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting equipment:', error.message);
      throw error;
    }
    
    console.log('Equipment deleted successfully');
  } catch (error) {
    console.error('Error in deleteEquipment:', error);
    throw error;
  }
}
