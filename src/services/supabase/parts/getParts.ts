
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

export async function getParts(): Promise<Part[]> {
  try {
    console.log('🔍 Fetching all parts from Supabase...');
    
    const { data, error } = await supabase
      .from('parts_inventory')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching parts:', error);
      throw error;
    }
    
    console.log('✅ Parts fetched successfully:', data?.length || 0);
    
    // Convert database records to Part objects
    return (data || []).map(part => ({
      id: part.id,
      name: part.name || '',
      partNumber: part.part_number || '',
      category: part.category || '',
      manufacturer: part.supplier || '',
      compatibility: Array.isArray(part.compatible_with) ? part.compatible_with : [],
      stock: part.quantity || 0,
      price: part.unit_price !== null ? part.unit_price : 0,
      location: part.location || '',
      reorderPoint: part.reorder_threshold || 5,
      image: part.image_url || 'https://placehold.co/100x100/png'
    }));
  } catch (error) {
    console.error('Unexpected error in getParts():', error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
}
