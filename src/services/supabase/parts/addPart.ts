
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

/**
 * Adds a new part to the inventory
 * 
 * @param part The part data to add (without ID)
 * @returns Promise resolving to the added part with its ID
 */
export async function addPart(part: Omit<Part, 'id'>): Promise<Part> {
  console.log('➕ Adding new part:', part);
  
  // First check if a part with the same part number already exists
  if (part.partNumber) {
    const { data: existingParts, error: checkError } = await supabase
      .from('parts_inventory')
      .select('id, name')
      .eq('part_number', part.partNumber)
      .limit(1);
    
    if (checkError) {
      console.error('Error checking for existing part:', checkError);
    } else if (existingParts && existingParts.length > 0) {
      console.warn('A part with this part number already exists:', existingParts[0]);
      throw new Error(`Une pièce avec le numéro "${part.partNumber}" existe déjà.`);
    }
  }
  
  // Prepare data for insertion
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
    image_url: part.image
  };
  
  // Insert the part
  const { data, error } = await supabase
    .from('parts_inventory')
    .insert(partData)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding part:', error);
    throw error;
  }
  
  if (!data) {
    throw new Error('No data returned from insert operation');
  }
  
  // Convert the database record to a Part object
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
    image: data.image_url || 'https://placehold.co/100x100/png'
  };
}
