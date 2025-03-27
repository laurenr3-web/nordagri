
import { supabase } from '@/integrations/supabase/client';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export interface Equipment {
  id: number;
  name: string;
  model?: string;
  manufacturer?: string;
  year?: number;
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  status?: string;
  location?: string;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  notes?: string;
  image?: string; // Client-side property only, not stored in database
  type?: string;
  category?: string;
}

export interface EquipmentFilter {
  search?: string;
  status?: string[];
  type?: string[];
  category?: string[];
  manufacturer?: string[];
  location?: string[];
  yearMin?: number;
  yearMax?: number;
  nextMaintenanceBefore?: Date;
}

export const equipmentService = {
  // Fetch all equipment with optional filters
  async getEquipment(filters?: EquipmentFilter): Promise<Equipment[]> {
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
  },
  
  // Search equipment by name or other properties
  async searchEquipment(searchTerm: string): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,serial_number.ilike.%${searchTerm}%`);
    
    if (error) {
      console.error('Error searching equipment:', error);
      throw error;
    }
    
    return (data || []).map(mapEquipmentFromDatabase);
  },
  
  // Add new equipment with image upload support
  async addEquipment(equipment: Omit<Equipment, 'id'>, imageFile?: File): Promise<Equipment> {
    let imagePath = equipment.image;
    
    // Upload image if provided
    if (imageFile) {
      imagePath = await uploadEquipmentImage(imageFile);
    }
    
    // Create a copy of the equipment object without the image property
    const { image, ...equipmentWithoutImage } = equipment;
    
    // Convert to database format
    const equipmentData = mapEquipmentToDatabase(equipmentWithoutImage);
    
    const { data, error } = await supabase
      .from('equipment')
      .insert(equipmentData)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding equipment:', error);
      throw error;
    }
    
    // Return the equipment with the image included in the response
    return {
      ...mapEquipmentFromDatabase(data),
      image: imagePath
    };
  },
  
  // Update equipment with image upload support
  async updateEquipment(equipment: Equipment, imageFile?: File): Promise<Equipment> {
    let imagePath = equipment.image;
    
    // Upload image if provided
    if (imageFile) {
      imagePath = await uploadEquipmentImage(imageFile);
    }
    
    // Separate image from data to be sent to the database
    const { image, ...equipmentWithoutImage } = equipment;
    
    const equipmentData = mapEquipmentToDatabase(equipmentWithoutImage);
    
    const { error } = await supabase
      .from('equipment')
      .update(equipmentData)
      .eq('id', equipment.id);
    
    if (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
    
    return {
      ...equipment,
      image: imagePath
    };
  },
  
  // Delete equipment
  async deleteEquipment(equipmentId: number): Promise<void> {
    // First attempt to get the image path
    const { data: equipment } = await supabase
      .from('equipment')
      .select('image')
      .eq('id', equipmentId)
      .single();
    
    // Delete the equipment record
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', equipmentId);
    
    if (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
    
    // TODO: Add storage bucket integration for deleting images
    // if (equipment?.image && equipment.image.startsWith('equipment/')) {
    //   await deleteEquipmentImage(equipment.image);
    // }
  },
  
  // Get equipment by ID
  async getEquipmentById(equipmentId: number): Promise<Equipment> {
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
  },
  
  // Get equipment statistics
  async getEquipmentStats(): Promise<{
    total: number;
    operational: number;
    maintenance: number;
    repair: number;
    byType: Record<string, number>;
    byManufacturer: Record<string, number>;
  }> {
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
  },
  
  // Get maintenance history for equipment
  async getEquipmentMaintenanceHistory(equipmentId: number): Promise<any[]> {
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
  },
  
  // Get unique values for filtering
  async getFilterOptions(): Promise<{
    manufacturers: string[];
    types: string[];
    categories: string[];
    statuses: string[];
    locations: string[];
  }> {
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
};

// Helper function to map database fields to Equipment interface
function mapEquipmentFromDatabase(item: any): Equipment {
  return {
    id: item.id,
    name: item.name,
    model: item.model,
    manufacturer: item.manufacturer,
    year: item.year,
    serialNumber: item.serial_number,
    purchaseDate: item.purchase_date ? new Date(item.purchase_date) : undefined,
    purchasePrice: item.purchase_price,
    status: item.status || 'operational',
    location: item.current_location,
    lastMaintenance: item.last_maintenance ? new Date(item.last_maintenance) : undefined,
    nextMaintenance: item.next_maintenance ? new Date(item.next_maintenance) : undefined,
    notes: item.notes,
    type: item.type || 'Tractor',
    category: item.category || 'Heavy Equipment',
    image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop' // Default image
  };
}

// Helper function to map Equipment interface to database fields
function mapEquipmentToDatabase(equipment: Omit<Equipment, 'id' | 'image'> & { id?: number }): any {
  return {
    id: equipment.id,
    name: equipment.name,
    model: equipment.model,
    manufacturer: equipment.manufacturer,
    year: equipment.year,
    serial_number: equipment.serialNumber,
    purchase_date: equipment.purchaseDate?.toISOString(),
    purchase_price: equipment.purchasePrice,
    status: equipment.status || 'operational',
    current_location: equipment.location,
    last_maintenance: equipment.lastMaintenance?.toISOString(),
    next_maintenance: equipment.nextMaintenance?.toISOString(),
    notes: equipment.notes,
    type: equipment.type,
    category: equipment.category
    // No image field here because it doesn't exist in the database
  };
}

// Apply filters to a query
function applyFilters(
  query: PostgrestFilterBuilder<any, any, any>,
  filters: EquipmentFilter
): PostgrestFilterBuilder<any, any, any> {
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,model.ilike.%${filters.search}%,serial_number.ilike.%${filters.search}%`);
  }
  
  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }
  
  if (filters.type && filters.type.length > 0) {
    query = query.in('type', filters.type);
  }
  
  if (filters.category && filters.category.length > 0) {
    query = query.in('category', filters.category);
  }
  
  if (filters.manufacturer && filters.manufacturer.length > 0) {
    query = query.in('manufacturer', filters.manufacturer);
  }
  
  if (filters.location && filters.location.length > 0) {
    query = query.in('current_location', filters.location);
  }
  
  if (filters.yearMin) {
    query = query.gte('year', filters.yearMin);
  }
  
  if (filters.yearMax) {
    query = query.lte('year', filters.yearMax);
  }
  
  if (filters.nextMaintenanceBefore) {
    query = query.lte('next_maintenance', filters.nextMaintenanceBefore.toISOString());
  }
  
  return query;
}

// Upload equipment image
async function uploadEquipmentImage(file: File): Promise<string> {
  // TODO: Add storage bucket implementation
  // For now, return a placeholder
  console.log('Image upload would happen here for:', file.name);
  return 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop';
}

// Delete equipment image
async function deleteEquipmentImage(path: string): Promise<void> {
  // TODO: Add storage bucket implementation
  console.log('Image deletion would happen here for:', path);
}
