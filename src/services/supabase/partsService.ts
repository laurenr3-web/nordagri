
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

export const partsService = {
  // Fetch all parts from the database
  async getParts(): Promise<Part[]> {
    const { data, error } = await supabase
      .from('parts_inventory')
      .select('*');
    
    if (error) {
      console.error('Error fetching parts:', error);
      throw error;
    }
    
    // Convert database records to Part objects
    return (data || []).map(part => ({
      id: part.id,
      name: part.name,
      partNumber: part.part_number || '',
      category: part.category || '',
      manufacturer: part.supplier || '',
      compatibleWith: part.compatible_with || [],
      quantity: part.quantity,
      price: part.unit_price?.toString() || '0',
      location: part.location || '',
      lastOrdered: part.last_ordered ? new Date(part.last_ordered) : undefined,
      reorderThreshold: part.reorder_threshold || 5,
      image: 'https://placehold.co/100x100/png',
      createdAt: part.created_at ? new Date(part.created_at) : new Date(),
      updatedAt: part.updated_at ? new Date(part.updated_at) : new Date()
    }));
  },
  
  // Add a new part to the database
  async addPart(part: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>): Promise<Part> {
    const partData = {
      name: part.name,
      part_number: part.partNumber,
      category: part.category,
      supplier: part.manufacturer,
      compatible_with: part.compatibleWith,
      quantity: part.quantity,
      unit_price: part.price ? parseFloat(part.price) : null,
      location: part.location,
      last_ordered: part.lastOrdered?.toISOString(),
      reorder_threshold: part.reorderThreshold
    };
    
    const { data, error } = await supabase
      .from('parts_inventory')
      .insert(partData)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding part:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      partNumber: data.part_number || '',
      category: data.category || '',
      manufacturer: data.supplier || '',
      compatibleWith: data.compatible_with || [],
      quantity: data.quantity,
      price: data.unit_price?.toString() || '0',
      location: data.location || '',
      lastOrdered: data.last_ordered ? new Date(data.last_ordered) : undefined,
      reorderThreshold: data.reorder_threshold || 5,
      image: 'https://placehold.co/100x100/png',
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
      updatedAt: data.updated_at ? new Date(data.updated_at) : new Date()
    };
  },
  
  // Update a part in the database
  async updatePart(part: Part): Promise<Part> {
    const partData = {
      name: part.name,
      part_number: part.partNumber,
      category: part.category,
      supplier: part.manufacturer,
      compatible_with: part.compatibleWith,
      quantity: part.quantity,
      unit_price: part.price ? parseFloat(part.price) : null,
      location: part.location,
      last_ordered: part.lastOrdered?.toISOString(),
      reorder_threshold: part.reorderThreshold,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('parts_inventory')
      .update(partData)
      .eq('id', part.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating part:', error);
      throw error;
    }
    
    return {
      ...part,
      updatedAt: new Date()
    };
  },
  
  // Delete a part from the database
  async deletePart(partId: number): Promise<void> {
    const { error } = await supabase
      .from('parts_inventory')
      .delete()
      .eq('id', partId);
    
    if (error) {
      console.error('Error deleting part:', error);
      throw error;
    }
  }
};
