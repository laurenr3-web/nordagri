
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

/**
 * Add a new part to the database
 * @param part Part data (without ID)
 * @returns The newly created part with ID
 */
export async function addPart(part: Omit<Part, 'id'>): Promise<Part> {
  try {
    console.log('Adding part to database:', part);
    
    // Extract user_id from auth session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    // Convert number[] to string[] for compatibility with Supabase
    const compatibilityAsStrings = part.compatibility.map(id => id.toString());
    
    // Prepare part data for Supabase
    const partData = {
      name: part.name,
      part_number: part.partNumber || part.reference || '',
      category: part.category,
      supplier: part.manufacturer,
      compatible_with: compatibilityAsStrings, // Convert to string[] for Supabase
      quantity: part.stock || part.quantity || 0,
      unit_price: part.price || 0,
      location: part.location || '',
      reorder_threshold: part.reorderPoint || part.minimumStock || 5,
      image_url: part.image || part.imageUrl || 'https://placehold.co/100x100/png',
      owner_id: userId
    };
    
    // Insert part into database
    const { data, error } = await supabase
      .from('parts_inventory')
      .insert(partData)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding part:', error);
      throw new Error(error.message);
    }
    
    if (!data) {
      throw new Error("No data returned from insert operation");
    }
    
    // Convert the Supabase data back to our Part format
    // Convert compatible_with from string[] back to number[] for frontend
    const compatibilityAsNumbers = data.compatible_with ? 
      data.compatible_with.map(id => parseInt(id, 10)) : 
      [];
    
    // Create and return a properly typed Part object
    const newPart: Part = {
      id: data.id,
      name: data.name,
      partNumber: data.part_number,
      reference: data.part_number,
      category: data.category,
      manufacturer: data.supplier,
      compatibility: compatibilityAsNumbers, // Convert back to number[]
      compatibleWith: compatibilityAsNumbers, // For compatibility
      stock: data.quantity,
      quantity: data.quantity,
      price: data.unit_price,
      location: data.location,
      reorderPoint: data.reorder_threshold,
      minimumStock: data.reorder_threshold,
      image: data.image_url,
      imageUrl: data.image_url
    };
    
    console.log('Part added successfully:', newPart);
    return newPart;
    
  } catch (error: any) {
    console.error('Error in addPart service:', error);
    throw new Error(`Failed to add part: ${error.message}`);
  }
}
