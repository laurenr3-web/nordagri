
import { supabase } from '@/integrations/supabase/client';
import { Equipment, EquipmentFilter, EquipmentStats, FilterOptions } from './types';
import { mapEquipmentFromDatabase } from './mappers';
import { applyFilters } from './filters';

// Fetch all equipment with optional filters
export async function getEquipment(filters?: EquipmentFilter): Promise<Equipment[]> {
  let query = supabase
    .from('equipment')
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
  
  return (data || []).map(mapEquipmentFromDatabase);
}

// Search equipment by name or other properties
export async function searchEquipment(searchTerm: string): Promise<Equipment[]> {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,serial_number.ilike.%${searchTerm}%`);
  
  if (error) {
    console.error('Error searching equipment:', error);
    throw error;
  }
  
  return (data || []).map(mapEquipmentFromDatabase);
}

// Get equipment by ID
export async function getEquipmentById(equipmentId: number): Promise<Equipment> {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', equipmentId)
    .single();
  
  if (error) {
    console.error('Error fetching equipment by ID:', error);
    throw error;
  }
  
  return mapEquipmentFromDatabase(data);
}

// Get equipment statistics
export async function getEquipmentStats(): Promise<EquipmentStats> {
  const { data, error } = await supabase
    .from('equipment')
    .select('*');
    
  if (error) {
    console.error('Error fetching equipment stats:', error);
    throw error;
  }
  
  const stats = {
    total: data.length,
    operational: data.filter(item => item.status === 'operational').length,
    maintenance: data.filter(item => item.status === 'maintenance').length,
    repair: data.filter(item => item.status === 'repair').length,
    byType: {},
    byManufacturer: {}
  };
  
  // Calculate stats by type
  data.forEach(item => {
    if (item.type) {
      if (!stats.byType[item.type]) {
        stats.byType[item.type] = 0;
      }
      stats.byType[item.type]++;
    }
    
    if (item.manufacturer) {
      if (!stats.byManufacturer[item.manufacturer]) {
        stats.byManufacturer[item.manufacturer] = 0;
      }
      stats.byManufacturer[item.manufacturer]++;
    }
  });
  
  return stats;
}

// Get maintenance history for equipment
export async function getEquipmentMaintenanceHistory(equipmentId: number): Promise<any[]> {
  const { data, error } = await supabase
    .from('maintenance_tasks')
    .select('*')
    .eq('equipment_id', equipmentId)
    .order('due_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching equipment maintenance history:', error);
    throw error;
  }
  
  return data || [];
}

// Get unique values for filtering
export async function getFilterOptions(): Promise<FilterOptions> {
  const { data, error } = await supabase
    .from('equipment')
    .select('manufacturer, type, category, status, current_location');
  
  if (error) {
    console.error('Error fetching filter options:', error);
    throw error;
  }
  
  const options = {
    manufacturers: [] as string[],
    types: [] as string[],
    categories: [] as string[],
    statuses: [] as string[],
    locations: [] as string[]
  };
  
  data.forEach(item => {
    if (item.manufacturer && !options.manufacturers.includes(item.manufacturer)) {
      options.manufacturers.push(item.manufacturer);
    }
    
    if (item.type && !options.types.includes(item.type)) {
      options.types.push(item.type);
    }
    
    if (item.category && !options.categories.includes(item.category)) {
      options.categories.push(item.category);
    }
    
    if (item.status && !options.statuses.includes(item.status)) {
      options.statuses.push(item.status);
    }
    
    if (item.current_location && !options.locations.includes(item.current_location)) {
      options.locations.push(item.current_location);
    }
  });
  
  return options;
}
