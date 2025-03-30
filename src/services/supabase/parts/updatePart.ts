
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

/**
 * Met à jour une pièce dans l'inventaire
 * 
 * @param part Les données complètes de la pièce à mettre à jour
 * @returns Promise résolvant à la pièce mise à jour
 */
export async function updatePart(part: Part): Promise<Part> {
  // Validation de l'ID
  if (!part.id) {
    throw new Error("L'ID de la pièce est requis pour la mise à jour");
  }
  
  console.log("🔄 Mise à jour de la pièce:", part);
  
  try {
    // Conversion du modèle de données Part vers la structure de la table parts_inventory
    const updateData = {
      name: part.name,
      part_number: part.partNumber || part.reference,
      category: part.category,
      supplier: part.manufacturer,
      compatible_with: Array.isArray(part.compatibility) 
        ? part.compatibility 
        : Array.isArray(part.compatibleWith)
          ? part.compatibleWith
          : [],
      quantity: typeof part.stock === 'number' 
        ? part.stock 
        : typeof part.quantity === 'number'
          ? part.quantity
          : 0,
      unit_price: typeof part.price === 'number' ? part.price : 0,
      location: part.location,
      reorder_threshold: typeof part.reorderPoint === 'number' 
        ? part.reorderPoint 
        : typeof part.minimumStock === 'number'
          ? part.minimumStock
          : 5,
      image_url: part.image || part.imageUrl
    };
    
    console.log("🧩 Données formatées pour la mise à jour:", updateData);
    
    // Mise à jour en base de données
    const { data, error } = await supabase
      .from('parts_inventory')
      .update(updateData)
      .eq('id', part.id)
      .select()
      .single();
    
    if (error) {
      console.error("❌ Erreur Supabase lors de la mise à jour:", error);
      
      // Messages d'erreur spécifiques basés sur les codes d'erreur
      if (error.code === '23505') {
        throw new Error("Une pièce avec cette référence existe déjà");
      } else if (error.code === '23502') {
        throw new Error("Certains champs obligatoires sont manquants");
      } else if (error.code === '42501') {
        throw new Error("Vous n'avez pas les permissions nécessaires pour mettre à jour cette pièce");
      } else {
        throw new Error(`Erreur lors de la mise à jour: ${error.message || "Problème inconnu"}`);
      }
    }
    
    if (!data) {
      throw new Error("La mise à jour a réussi mais aucune donnée n'a été retournée");
    }
    
    console.log("✅ Pièce mise à jour avec succès:", data);
    
    // Convertir les données retournées au format Part
    const updatedPart: Part = {
      id: data.id,
      name: data.name,
      partNumber: data.part_number || '',
      reference: data.part_number || '',
      category: data.category || '',
      manufacturer: data.supplier || '',
      compatibility: data.compatible_with || [],
      compatibleWith: data.compatible_with || [],
      stock: data.quantity,
      quantity: data.quantity,
      price: data.unit_price || 0,
      location: data.location || '',
      reorderPoint: data.reorder_threshold || 5,
      minimumStock: data.reorder_threshold || 5,
      image: data.image_url || 'https://placehold.co/100x100/png',
      imageUrl: data.image_url
    };
    
    return updatedPart;
  } catch (err: any) {
    console.error("❌ Exception lors de la mise à jour de la pièce:", err);
    throw err;
  }
}
