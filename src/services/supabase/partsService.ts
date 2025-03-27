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
      compatibility: part.compatible_with || [],
      stock: part.quantity,
      price: part.unit_price !== null ? part.unit_price : 0,
      location: part.location || '',
      reorderPoint: part.reorder_threshold || 5,
      image: 'https://placehold.co/100x100/png'
    }));
  },
  
  // Add a new part to the database
  async addPart(part: Omit<Part, 'id'>): Promise<Part> {
    const partData = {
      name: part.name,
      part_number: part.partNumber,
      category: part.category,
      supplier: part.manufacturer,
      compatible_with: part.compatibility,
      quantity: part.stock,
      unit_price: part.price,
      location: part.location,
      reorder_threshold: part.reorderPoint
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
      compatibility: data.compatible_with || [],
      stock: data.quantity,
      price: data.unit_price !== null ? data.unit_price : 0,
      location: data.location || '',
      reorderPoint: data.reorder_threshold || 5,
      image: 'https://placehold.co/100x100/png'
    };
  },

  // Update an existing part in the database
  async updatePart(part: Part): Promise<Part> {
    console.log('🔍 Updating part with ID:', part.id, 'Type:', typeof part.id);
    
    const partData = {
      name: part.name,
      part_number: part.partNumber,
      category: part.category,
      supplier: part.manufacturer,
      compatible_with: part.compatibility,
      quantity: part.stock,
      unit_price: part.price,
      location: part.location,
      reorder_threshold: part.reorderPoint,
      updated_at: new Date().toISOString()
    };
    
    try {
      console.log('🚀 Sending update request to Supabase...');
      
      const { data, error } = await supabase
        .from('parts_inventory')
        .update(partData)
        .eq('id', part.id)
        .select('*')
        .single();
      
      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }
      
      console.log('✅ Supabase update successful:', data);
      
      // Return the updated part with all fields
      return {
        id: data.id,
        name: data.name,
        partNumber: data.part_number || '',
        category: data.category || '',
        manufacturer: data.supplier || '',
        compatibility: data.compatible_with || [],
        stock: data.quantity,
        price: data.unit_price !== null ? data.unit_price : 0,
        location: data.location || '',
        reorderPoint: data.reorder_threshold || 5,
        image: part.image || 'https://placehold.co/100x100/png'
      };
    } catch (err) {
      console.error('💥 Exception in updatePart:', err);
      throw err;
    }
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

// Add individual function exports for direct imports
export const { getParts, addPart, updatePart, deletePart } = partsService;
