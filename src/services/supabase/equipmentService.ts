
import { supabase } from '@/integrations/supabase/client';

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
  image?: string;
  type?: string;
  category?: string;
}

export const equipmentService = {
  // Fetch all equipment
  async getEquipment(): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*');
    
    if (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      model: item.model,
      manufacturer: item.manufacturer,
      year: item.year,
      purchaseDate: item.purchase_date ? new Date(item.purchase_date) : undefined,
      purchasePrice: item.purchase_price,
      status: item.status || 'operational',
      location: item.current_location,
      lastMaintenance: item.last_maintenance ? new Date(item.last_maintenance) : undefined,
      nextMaintenance: item.next_maintenance ? new Date(item.next_maintenance) : undefined,
      notes: item.notes,
      type: item.type || 'Tractor',
      category: item.category || 'Heavy Equipment',
      image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop'
    }));
  },
  
  // Add new equipment
  async addEquipment(equipment: Omit<Equipment, 'id'>): Promise<Equipment> {
    const equipmentData = {
      name: equipment.name,
      model: equipment.model,
      manufacturer: equipment.manufacturer,
      year: equipment.year,
      purchase_date: equipment.purchaseDate?.toISOString(),
      purchase_price: equipment.purchasePrice,
      status: equipment.status || 'operational',
      current_location: equipment.location,
      last_maintenance: equipment.lastMaintenance?.toISOString(),
      next_maintenance: equipment.nextMaintenance?.toISOString(),
      notes: equipment.notes,
      type: equipment.type,
      category: equipment.category
    };
    
    const { data, error } = await supabase
      .from('equipment')
      .insert(equipmentData)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding equipment:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      model: data.model,
      manufacturer: data.manufacturer,
      year: data.year,
      purchaseDate: data.purchase_date ? new Date(data.purchase_date) : undefined,
      purchasePrice: data.purchase_price,
      status: data.status || 'operational',
      location: data.current_location,
      lastMaintenance: data.last_maintenance ? new Date(data.last_maintenance) : undefined,
      nextMaintenance: data.next_maintenance ? new Date(data.next_maintenance) : undefined,
      notes: data.notes,
      type: data.type || 'Tractor',
      category: data.category || 'Heavy Equipment',
      image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop'
    };
  },
  
  // Update equipment
  async updateEquipment(equipment: Equipment): Promise<Equipment> {
    const equipmentData = {
      name: equipment.name,
      model: equipment.model,
      manufacturer: equipment.manufacturer,
      year: equipment.year,
      purchase_date: equipment.purchaseDate?.toISOString(),
      purchase_price: equipment.purchasePrice,
      status: equipment.status,
      current_location: equipment.location,
      last_maintenance: equipment.lastMaintenance?.toISOString(),
      next_maintenance: equipment.nextMaintenance?.toISOString(),
      notes: equipment.notes,
      type: equipment.type,
      category: equipment.category,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('equipment')
      .update(equipmentData)
      .eq('id', equipment.id);
    
    if (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
    
    return equipment;
  },
  
  // Delete equipment
  async deleteEquipment(equipmentId: number): Promise<void> {
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', equipmentId);
    
    if (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
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
    
    return {
      id: data.id,
      name: data.name,
      model: data.model,
      manufacturer: data.manufacturer,
      year: data.year,
      purchaseDate: data.purchase_date ? new Date(data.purchase_date) : undefined,
      purchasePrice: data.purchase_price,
      status: data.status || 'operational',
      location: data.current_location,
      lastMaintenance: data.last_maintenance ? new Date(data.last_maintenance) : undefined,
      nextMaintenance: data.next_maintenance ? new Date(data.next_maintenance) : undefined,
      notes: data.notes,
      type: data.type || 'Tractor',
      category: data.category || 'Heavy Equipment',
      image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop'
    };
  }
};
