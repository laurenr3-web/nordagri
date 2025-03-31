
import { supabase } from '@/integrations/supabase/client';
import { Equipment, EquipmentFilter } from './types';
import { mapEquipmentFromDatabase } from './mappers';
import { buildEquipmentFilterQuery } from './filters';

/**
 * Récupère tous les équipements avec filtres optionnels
 */
export async function getEquipment(filter?: EquipmentFilter): Promise<Equipment[]> {
  try {
    console.log('Fetching equipment with filters:', filter);
    
    let query = supabase
      .from('equipment')
      .select('*');
    
    // Appliquer les filtres s'ils existent
    if (filter) {
      query = buildEquipmentFilterQuery(query, filter);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }
    
    return data.map(item => mapEquipmentFromDatabase(item));
  } catch (error) {
    console.error('Error in getEquipment:', error);
    throw error;
  }
}

/**
 * Récupère un équipement par son ID
 */
export async function getEquipmentById(id: number): Promise<Equipment | null> {
  try {
    console.log('Fetching equipment by ID:', id);
    
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Équipement non trouvé
      }
      console.error('Error fetching equipment by ID:', error);
      throw error;
    }
    
    return mapEquipmentFromDatabase(data);
  } catch (error) {
    console.error(`Error in getEquipmentById (${id}):`, error);
    throw error;
  }
}

/**
 * Recherche d'équipements par terme de recherche
 */
export async function searchEquipment(searchTerm: string): Promise<Equipment[]> {
  try {
    console.log('Searching equipment with term:', searchTerm);
    
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,manufacturer.ilike.%${searchTerm}%`)
      .order('name');
    
    if (error) {
      console.error('Error searching equipment:', error);
      throw error;
    }
    
    return data.map(item => mapEquipmentFromDatabase(item));
  } catch (error) {
    console.error('Error in searchEquipment:', error);
    throw error;
  }
}

// Re-export functions from other modules for backward compatibility
export { getEquipmentStats } from './stats';
export { getFilterOptions, getCategories } from './options';
export { getEquipmentMaintenanceHistory } from './maintenance';
