
import { supabase } from '@/integrations/supabase/client';
import { Equipment, EquipmentFilter, EquipmentStats, FilterOptions, Category } from './types';
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

/**
 * Récupère les statistiques des équipements
 */
export async function getEquipmentStats(): Promise<EquipmentStats> {
  try {
    // Récupérer tous les équipements
    const { data, error } = await supabase
      .from('equipment')
      .select('status, category, type');
    
    if (error) {
      console.error('Error fetching equipment stats:', error);
      throw error;
    }
    
    // Initialiser les statistiques
    const stats: EquipmentStats = {
      total: data.length,
      operational: 0,
      maintenance: 0,
      repair: 0,
      inactive: 0,
      byCategory: {},
      byType: {}
    };
    
    // Calculer les statistiques
    data.forEach(item => {
      // Statut
      switch (item.status) {
        case 'operational':
          stats.operational++;
          break;
        case 'maintenance':
          stats.maintenance++;
          break;
        case 'repair':
          stats.repair++;
          break;
        case 'inactive':
          stats.inactive++;
          break;
      }
      
      // Catégorie
      if (item.category) {
        stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
      }
      
      // Type
      if (item.type) {
        stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error in getEquipmentStats:', error);
    throw error;
  }
}

/**
 * Récupère l'historique de maintenance d'un équipement
 */
export async function getEquipmentMaintenanceHistory(equipmentId: number) {
  try {
    const { data, error } = await supabase
      .from('equipment_maintenance_schedule')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('due_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching equipment maintenance history:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error in getEquipmentMaintenanceHistory (${equipmentId}):`, error);
    throw error;
  }
}

/**
 * Récupère les options de filtrage pour les équipements
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  try {
    // Récupérer tous les équipements pour extraire les options de filtrage
    const { data, error } = await supabase
      .from('equipment')
      .select('status, type, category, manufacturer, location, year');
    
    if (error) {
      console.error('Error fetching filter options:', error);
      throw error;
    }
    
    // Initialiser les options de filtrage
    const options: FilterOptions = {
      status: [],
      type: [],
      category: [],
      manufacturer: [],
      location: [],
      yearRange: { min: Infinity, max: -Infinity }
    };
    
    // Extraire les options uniques
    data.forEach(item => {
      // Status
      if (item.status && !options.status.includes(item.status)) {
        options.status.push(item.status);
      }
      
      // Type
      if (item.type && !options.type.includes(item.type)) {
        options.type.push(item.type);
      }
      
      // Category
      if (item.category && !options.category.includes(item.category)) {
        options.category.push(item.category);
      }
      
      // Manufacturer
      if (item.manufacturer && !options.manufacturer.includes(item.manufacturer)) {
        options.manufacturer.push(item.manufacturer);
      }
      
      // Location
      if (item.location && !options.location.includes(item.location)) {
        options.location.push(item.location);
      }
      
      // Year range
      if (item.year) {
        options.yearRange.min = Math.min(options.yearRange.min, item.year);
        options.yearRange.max = Math.max(options.yearRange.max, item.year);
      }
    });
    
    // Si aucun équipement avec année, définir des valeurs par défaut
    if (options.yearRange.min === Infinity) {
      options.yearRange.min = new Date().getFullYear() - 20;
    }
    if (options.yearRange.max === -Infinity) {
      options.yearRange.max = new Date().getFullYear();
    }
    
    // Trier les options alphabétiquement
    options.status.sort();
    options.type.sort();
    options.category.sort();
    options.manufacturer.sort();
    options.location.sort();
    
    return options;
  } catch (error) {
    console.error('Error in getFilterOptions:', error);
    // Retourner des options par défaut en cas d'erreur
    return {
      status: ['operational', 'maintenance', 'repair', 'inactive'],
      type: [],
      category: [],
      manufacturer: [],
      location: [],
      yearRange: { 
        min: new Date().getFullYear() - 20, 
        max: new Date().getFullYear() 
      }
    };
  }
}

/**
 * Récupère les catégories d'équipements
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('equipment_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching equipment categories:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getCategories:', error);
    throw error;
  }
}
