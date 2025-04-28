
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';
import { compatibilityToStrings, compatibilityToNumbers } from '@/utils/compatibilityConverter';

export async function addPart(part: Omit<Part, 'id'>): Promise<Part> {
  try {
    // Get user ID from session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error("Vous devez être connecté pour ajouter une pièce");
    }
    
    // Convert compatibility from number[] to string[] for database
    const compatibleWithAsString = compatibilityToStrings(part.compatibility);

    // Map to database structure
    const dbPart = {
      name: part.name,
      part_number: part.partNumber,
      category: part.category,
      supplier: part.manufacturer,
      compatible_with: compatibleWithAsString, // Convert to string[] for storage
      quantity: part.stock,
      unit_price: part.price,
      location: part.location,
      reorder_threshold: part.reorderPoint,
      image_url: part.image,
      owner_id: userId
    };
    
    const { data, error } = await supabase
      .from('parts_inventory')
      .insert(dbPart)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error("La pièce a été ajoutée mais aucune donnée n'a été retournée");
    
    // Map back to Part interface with compatibility as number[]
    return {
      id: data.id,
      name: data.name,
      partNumber: data.part_number || '',
      category: data.category || '',
      manufacturer: data.supplier || '',
      compatibility: compatibilityToNumbers(data.compatible_with),
      stock: data.quantity,
      price: data.unit_price || 0,
      location: data.location || '',
      reorderPoint: data.reorder_threshold || 5,
      image: data.image_url || 'https://placehold.co/400x300/png?text=No+Image'
    };
  } catch (error: any) {
    console.error("Erreur lors de l'ajout de la pièce:", error);
    throw new Error(error.message || "Une erreur est survenue lors de l'ajout de la pièce");
  }
}
