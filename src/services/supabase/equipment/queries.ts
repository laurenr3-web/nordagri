
import { supabase } from '@/integrations/supabase/client';
import { Equipment, EquipmentFilter, EquipmentStats, FilterOptions } from './types';
import { mapEquipmentFromDatabase } from './mappers';
import { applyFilters } from './filters';

// Fetch all equipment with optional filters
export async function getEquipment(filters?: EquipmentFilter): Promise<Equipment[]> {
  try {
    console.log('Fetching equipment with filters:', filters);
    
    let query = supabase
      .from('equipments')
      .select('*');
    
    // Apply filters if provided
    if (filters) {
      query = applyFilters(query, filters);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} equipment records`);
    return (data || []).map(mapEquipmentFromDatabase);
  } catch (error) {
    console.error('Exception in getEquipment:', error);
    throw error;
  }
}

// Search equipment by name or other properties
export async function searchEquipment(searchTerm: string): Promise<Equipment[]> {
  try {
    const { data, error } = await supabase
      .from('equipments')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,serial_number.ilike.%${searchTerm}%`);
    
    if (error) {
      console.error('Error searching equipment:', error);
      throw error;
    }
    
    return (data || []).map(mapEquipmentFromDatabase);
  } catch (error) {
    console.error('Exception in searchEquipment:', error);
    throw error;
  }
}

// Get equipment by ID
export async function getEquipmentById(equipmentId: string): Promise<Equipment | null> {
  try {
    console.log(`Fetching equipment with ID ${equipmentId} from Supabase`);
    const { data, error } = await supabase
      .from('equipments')
      .select('*')
      .eq('id', equipmentId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching equipment by ID:', error);
      throw error;
    }
    
    if (!data) {
      console.log(`No equipment found with ID ${equipmentId}`);
      return null;
    }
    
    console.log('Equipment data from DB:', data);
    return mapEquipmentFromDatabase(data);
  } catch (error) {
    console.error('Exception in getEquipmentById:', error);
    throw error;
  }
}

// Get equipment statistics
export async function getEquipmentStats(): Promise<EquipmentStats> {
  try {
    const { data, error } = await supabase
      .from('equipments')
      .select('*');
      
    if (error) {
      console.error('Error fetching equipment stats:', error);
      throw error;
    }
    
    // Default stats structure
    const stats: EquipmentStats = {
      total: 0,
      operational: 0,
      maintenance: 0,
      repair: 0,
      byType: {},
      byManufacturer: {}
    };
    
    if (!data || data.length === 0) {
      return stats;
    }
    
    // Calculate stats
    stats.total = data.length;
    
    // Count by status
    data.forEach(item => {
      // Count by status
      if (item.status === 'operational') {
        stats.operational++;
      } else if (item.status === 'maintenance') {
        stats.maintenance++;
      } else if (item.status === 'repair') {
        stats.repair++;
      }
      
      // Count by type
      if (item.type) {
        stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      }
      
      // Count by manufacturer (from metadata)
      if (item.metadata && item.metadata.manufacturer) {
        const manufacturer = item.metadata.manufacturer;
        stats.byManufacturer[manufacturer] = (stats.byManufacturer[manufacturer] || 0) + 1;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Exception in getEquipmentStats:', error);
    throw error;
  }
}

// Get equipment maintenance history
export async function getEquipmentMaintenanceHistory(equipmentId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('performed_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching maintenance history:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception in getEquipmentMaintenanceHistory:', error);
    throw error;
  }
}

// Get filter options
export async function getFilterOptions(): Promise<FilterOptions> {
  try {
    const { data, error } = await supabase
      .from('equipments')
      .select('type, status, location, metadata');
    
    if (error) {
      console.error('Error fetching filter options:', error);
      throw error;
    }
    
    const options: FilterOptions = {
      manufacturers: [],
      types: [],
      categories: [],
      statuses: [],
      locations: []
    };
    
    // Extract unique values
    data.forEach(item => {
      // Extract manufacturers from metadata
      if (item.metadata && item.metadata.manufacturer) {
        const manufacturer = item.metadata.manufacturer;
        if (!options.manufacturers.includes(manufacturer)) {
          options.manufacturers.push(manufacturer);
        }
      }
      
      // Extract types
      if (item.type && !options.types.includes(item.type)) {
        options.types.push(item.type);
      }
      
      // Extract categories from metadata
      if (item.metadata && item.metadata.category) {
        const category = item.metadata.category;
        if (!options.categories.includes(category)) {
          options.categories.push(category);
        }
      }
      
      // Extract statuses
      if (item.status && !options.statuses.includes(item.status)) {
        options.statuses.push(item.status);
      }
      
      // Extract locations
      if (item.location && !options.locations.includes(item.location)) {
        options.locations.push(item.location);
      }
    });
    
    // Sort options
    options.manufacturers.sort();
    options.types.sort();
    options.categories.sort();
    options.statuses.sort();
    options.locations.sort();
    
    return options;
  } catch (error) {
    console.error('Exception in getFilterOptions:', error);
    throw error;
  }
}
