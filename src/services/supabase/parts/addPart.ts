
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';
import { compatibilityToStrings } from '@/utils/compatibilityConverter';

/**
 * Adds a new part to the inventory
 * 
 * @param part The part data to add (without ID)
 * @returns Promise resolving to the added part with its ID
 */
export async function addPart(part: Omit<Part, 'id'>): Promise<Part> {
  console.log('➕ Adding new part:', part);
  
  // Get the current user ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error("Vous devez être connecté pour ajouter une pièce");
  }
  
  // First check if a part with the same name already exists for this user
  const { data: existingNameCheck, error: nameCheckError } = await supabase
    .from('parts_inventory')
    .select('id, name')
    .eq('owner_id', userId)
    .eq('name', part.name)
    .limit(1);
  
  if (nameCheckError) {
    console.error('Error checking for existing part name:', nameCheckError);
  } else if (existingNameCheck && existingNameCheck.length > 0) {
    console.warn('A part with this name already exists:', existingNameCheck[0]);
    throw new Error(`Une pièce avec le nom "${part.name}" existe déjà.`);
  }
  
  // Then check if a part with the same part number exists
  if (part.partNumber) {
    const { data: existingParts, error: checkError } = await supabase
      .from('parts_inventory')
      .select('id, name')
      .eq('owner_id', userId)
      .eq('part_number', part.partNumber)
      .limit(1);
    
    if (checkError) {
      console.error('Error checking for existing part number:', checkError);
    } else if (existingParts && existingParts.length > 0) {
      console.warn('A part with this part number already exists:', existingParts[0]);
      throw new Error(`Une pièce avec le numéro "${part.partNumber}" existe déjà.`);
    }
  }
  
  // Convert compatibility from number[] to string[] for Supabase
  const compatibleWithAsString = compatibilityToStrings(part.compatibility);
  
  // Prepare data for insertion
  const partData = {
    name: part.name,
    part_number: part.partNumber,
    category: part.category,
    supplier: part.manufacturer,
    compatible_with: compatibleWithAsString, // Convert to string[] for the database
    quantity: part.stock,
    unit_price: part.price,
    location: part.location,
    reorder_threshold: part.reorderPoint,
    image_url: part.image,
    owner_id: userId // Explicitly set the owner_id to the current user
  };
  
  // Insert the part
  const { data, error } = await supabase
    .from('parts_inventory')
    .insert(partData)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding part:', error);
    // Provide more user-friendly error messages
    if (error.code === '23505') {
      throw new Error("Une pièce avec ces informations existe déjà");
    } else if (error.code === '23502') {
      throw new Error("Des informations requises sont manquantes");
    } else {
      throw error;
    }
  }
  
  if (!data) {
    throw new Error('No data returned from insert operation');
  }
  
  // Convert the database record to a Part object with converted compatibility back to number[]
  return {
    id: data.id,
    name: data.name,
    partNumber: data.part_number || '',
    category: data.category || '',
    manufacturer: data.supplier || '',
    compatibility: data.compatible_with 
      ? compatibilityToNumbers(data.compatible_with) 
      : [],
    stock: data.quantity,
    price: data.unit_price !== null ? data.unit_price : 0,
    location: data.location || '',
    reorderPoint: data.reorder_threshold || 5,
    image: data.image_url || 'https://placehold.co/100x100/png'
  };
}

// Helper function to convert compatibility
function compatibilityToNumbers(compatibility: string[] | number[]): number[] {
  if (!compatibility) return [];
  if (typeof compatibility[0] === 'number') return compatibility as number[];
  
  return (compatibility as string[])
    .map(id => parseInt(id, 10))
    .filter(id => !isNaN(id));
}
