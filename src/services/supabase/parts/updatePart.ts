
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

export async function updatePart(part: Part): Promise<Part> {
  // Map our Part interface to the database structure
  const dbPart = {
    name: part.name,
    part_number: part.partNumber,
    category: part.category,
    supplier: part.manufacturer,
    compatible_with: part.compatibility,
    quantity: part.stock,
    unit_price: part.price,
    location: part.location,
    reorder_threshold: part.reorderPoint,
    image_url: part.image,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('parts_inventory')
    .update(dbPart)
    .eq('id', part.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating part:', error);
    throw error;
  }

  // Map back to our Part interface
  return {
    id: data.id,
    name: data.name,
    partNumber: data.part_number || '',
    category: data.category || '',
    manufacturer: data.supplier || '',
    compatibility: data.compatible_with || [],
    stock: data.quantity,
    price: data.unit_price || 0,
    location: data.location || '',
    reorderPoint: data.reorder_threshold || 5,
    image: data.image_url || 'https://placehold.co/400x300/png?text=No+Image'
  };
}
