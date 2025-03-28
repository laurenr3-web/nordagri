import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

/**
 * Met à jour une pièce existante dans la base de données
 * @param part La pièce avec les valeurs mises à jour
 * @returns Promise résolvant vers la pièce mise à jour
 */
export async function updatePart(part: Part): Promise<Part> {
  console.log('🔄 Début de la mise à jour de pièce avec ID:', part.id);
  
  try {
    // Validation des champs obligatoires
    if (!part.name || part.stock === undefined) {
      throw new Error("Les champs obligatoires 'name' et 'stock' doivent être définis");
    }

    // Vérification que l'ID est un nombre
    if (typeof part.id !== 'number') {
      throw new Error("L'ID de la pièce doit être un nombre pour la mise à jour");
    }

    // Préparation des données avec correspondance exacte des noms de colonnes
    const updateData = {
      name: part.name,
      part_number: part.partNumber,
      category: part.category,
      supplier: part.manufacturer,
      compatible_with: Array.isArray(part.compatibility) ? part.compatibility : [],
      quantity: part.stock,
      unit_price: part.price !== undefined ? part.price : null,
      location: part.location || null,
      reorder_threshold: part.reorderPoint || null,
      image_url: part.image || null,
      updated_at: new Date().toISOString()
    };
    
    console.log('Données envoyées à Supabase:', updateData);
    
    // Exécution de la requête avec debug complet
    const { data, error, status } = await supabase
      .from('parts_inventory')
      .update(updateData)
      .eq('id', part.id)
      .select('*')
      .single();
    
    if (error) {
      console.error('Erreur Supabase:', error);
      console.error('Code de statut HTTP:', status);
      throw error;
    }
    
    if (!data) {
      console.error('Aucune donnée retournée après la mise à jour');
      throw new Error('Pièce non trouvée ou problème de permissions');
    }
    
    console.log('Mise à jour réussie, données retournées:', data);
    
    // Mappage correct des données retournées
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
  } catch (err: any) {
    console.error('Exception lors de la mise à jour:', err);
    throw err;
  }
}
