import { supabase } from '@/integrations/supabase/client';
import { Equipment, EquipmentFilter, EquipmentStats, FilterOptions } from './types';
import { mapEquipmentFromDatabase } from './mappers';

/**
 * Get all equipment
 */
export const getEquipment = async (filters: EquipmentFilter): Promise<Equipment[]> => {
  try {
    console.log('Fetching equipment with filters:', filters);
    let query = supabase.from('equipments').select('*');
    
    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,type.ilike.%${filters.search}%,serial_number.ilike.%${filters.search}%`);
    }
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    // The manufacturer is stored in metadata JSON field
    if (filters.manufacturer) {
      query = query.contains('metadata', { manufacturer: filters.manufacturer });
    }
    
    // The category is stored in metadata JSON field
    if (filters.category) {
      query = query.contains('metadata', { category: filters.category });
    }
    
    // Status is a direct column
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    // Location is stored in metadata JSON field
    if (filters.location) {
      query = query.contains('metadata', { location: filters.location });
    }
    
    if (filters.year) {
      query = query.contains('metadata', { year: filters.year });
    }
    
    // Apply sorting
    if (filters.sortBy) {
      const direction = filters.sortOrder || 'asc';
      // Special logic for sorting metadata fields
      if (['manufacturer', 'category', 'location'].includes(filters.sortBy)) {
        // Default to name sorting for metadata fields since JSON sorting is complex
        query = query.order('name', { ascending: direction === 'asc' });
      } else {
        query = query.order(filters.sortBy, { ascending: direction === 'asc' });
      }
    } else {
      // Default sorting by name
      query = query.order('name');
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }
    
    // Map database records to Equipment objects
    return data.map(record => mapEquipmentFromDatabase(record));
  } catch (error) {
    console.error('Error in getEquipment:', error);
    throw error;
  }
};

/**
 * Get equipment by ID
 */
export const getEquipmentById = async (id: string): Promise<Equipment | null> => {
  try {
    const { data, error } = await supabase
      .from('equipments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching equipment by ID:', error);
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    return mapEquipmentFromDatabase(data);
  } catch (error) {
    console.error('Error in getEquipmentById:', error);
    throw error;
  }
};

/**
 * Get equipment stats
 */
export const getEquipmentStats = async (): Promise<EquipmentStats> => {
  try {
    const { data, error } = await supabase
      .from('equipments')
      .select('status, type, metadata');
    
    if (error) {
      console.error('Error fetching equipment stats:', error);
      throw error;
    }
    
    const total = data.length;
    const operational = data.filter(item => item.status === 'operational').length;
    const maintenance = data.filter(item => item.status === 'maintenance').length;
    const repair = data.filter(item => item.status === 'repair').length;
    
    const byType: Record<string, number> = {};
    const byManufacturer: Record<string, number> = {};
    
    data.forEach(item => {
      if (item.type) {
        byType[item.type] = (byType[item.type] || 0) + 1;
      }
      
      // Get manufacturer from metadata
      const metadata = item.metadata as Record<string, any> | null;
      if (metadata && metadata.manufacturer) {
        const manufacturer = String(metadata.manufacturer);
        byManufacturer[manufacturer] = (byManufacturer[manufacturer] || 0) + 1;
      }
    });
    
    return {
      total,
      operational,
      maintenance,
      repair,
      byType,
      byManufacturer
    };
  } catch (error) {
    console.error('Error in getEquipmentStats:', error);
    throw error;
  }
};

/**
 * Get maintenance history for an equipment
 */
export const getEquipmentMaintenanceHistory = async (equipmentId: string): Promise<any[]> => {
  try {
    // TODO: Implement this function to fetch maintenance history from the database
    // This is just a placeholder, replace with actual implementation
    console.log(`Fetching maintenance history for equipment ID: ${equipmentId}`);
    
    // Simulate a delay to mimic a real database query
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        equipmentId: equipmentId,
        date: new Date(),
        description: 'Oil change',
        cost: 100,
      },
      {
        id: '2',
        equipmentId: equipmentId,
        date: new Date(),
        description: 'Tire change',
        cost: 200,
      },
    ];
  } catch (error) {
    console.error('Error in getEquipmentMaintenanceHistory:', error);
    throw error;
  }
};

/**
 * Get filter options for equipment
 */
export const getFilterOptions = async (): Promise<FilterOptions> => {
  try {
    const { data, error } = await supabase
      .from('equipments')
      .select('type, metadata, status');
    
    if (error) {
      console.error('Error fetching filter options:', error);
      throw error;
    }

    // Extract unique values for each filter
    const manufacturers = new Set<string>();
    const types = new Set<string>();
    const categories = new Set<string>();
    const statuses = new Set<string>();
    const locations = new Set<string>();

    data.forEach(item => {
      // Add non-empty values to respective sets
      if (item.type) types.add(item.type);
      if (item.status) statuses.add(item.status);
      
      // Handle metadata fields - ensure we safely access properties
      const metadata = item.metadata as Record<string, any> | null;
      
      if (metadata && typeof metadata === 'object') {
        if (metadata.manufacturer) manufacturers.add(String(metadata.manufacturer));
        if (metadata.category) categories.add(String(metadata.category));
        if (metadata.location) locations.add(String(metadata.location));
      }
    });

    return {
      manufacturers: Array.from(manufacturers).sort(),
      types: Array.from(types).sort(),
      categories: Array.from(categories).sort(),
      statuses: Array.from(statuses).sort(),
      locations: Array.from(locations).sort()
    };
  } catch (error) {
    console.error('Error in getFilterOptions:', error);
    throw error;
  }
};

/**
 * Search equipment based on filters
 */
export const searchEquipment = async (filters: EquipmentFilter): Promise<Equipment[]> => {
  try {
    console.log('Searching equipment with filters:', filters);
    let query = supabase.from('equipments').select('*');
    
    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,type.ilike.%${filters.search}%,serial_number.ilike.%${filters.search}%`);
    }
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    // The manufacturer is stored in metadata JSON field
    if (filters.manufacturer) {
      query = query.contains('metadata', { manufacturer: filters.manufacturer });
    }
    
    // The category is stored in metadata JSON field
    if (filters.category) {
      query = query.contains('metadata', { category: filters.category });
    }
    
    // Status is a direct column
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    // Location is stored in metadata JSON field
    if (filters.location) {
      query = query.contains('metadata', { location: filters.location });
    }
    
    if (filters.year) {
      query = query.contains('metadata', { year: filters.year });
    }
    
    // Apply sorting
    if (filters.sortBy) {
      const direction = filters.sortOrder || 'asc';
      // Special logic for sorting metadata fields
      if (['manufacturer', 'category', 'location'].includes(filters.sortBy)) {
        // Default to name sorting for metadata fields since JSON sorting is complex
        query = query.order('name', { ascending: direction === 'asc' });
      } else {
        query = query.order(filters.sortBy, { ascending: direction === 'asc' });
      }
    } else {
      // Default sorting by name
      query = query.order('name');
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error searching equipment:', error);
      throw error;
    }
    
    // Map database records to Equipment objects
    return data.map(record => mapEquipmentFromDatabase(record));
  } catch (error) {
    console.error('Error in searchEquipment:', error);
    throw error;
  }
};
