
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

export async function addPart(part: Omit<Part, 'id'>): Promise<Part> {
  try {
    // Get user ID from session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error("Vous devez être connecté pour ajouter une pièce");
    }
    
    // Ensure compatibility is string[] for database storage
    const compatibilityAsStrings = Array.isArray(part.compatibility) 
      ? part.compatibility.map(id => id.toString()) 
      : [];
    
    // Map to database structure
    const dbPart = {
      name: part.name,
      part_number: part.partNumber,
      category: part.category,
      supplier: part.manufacturer,
      compatible_with: compatibilityAsStrings, // Ensure it's string[] for Supabase
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
    
    // Map back to Part interface
    return {
      id: data.id,
      name: data.name,
      partNumber: data.part_number || '',
      category: data.category || '',
      manufacturer: data.supplier || '',
      compatibility: data.compatible_with || [], // Will be string[] from database
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
