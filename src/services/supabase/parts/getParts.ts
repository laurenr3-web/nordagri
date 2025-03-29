
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

export async function getParts(): Promise<Part[]> {
  console.log('🔍 Fetching all parts from Supabase...');
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
    image: part.image_url || 'https://placehold.co/100x100/png'
  }));
}
