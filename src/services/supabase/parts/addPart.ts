
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

export async function addPart(part: Omit<Part, 'id'>): Promise<Part> {
  console.log('➕ Adding new part:', part);
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
}
