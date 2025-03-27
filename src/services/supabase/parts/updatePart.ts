
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

/**
 * Convertit un ID de pièce en nombre si nécessaire
 * @param id L'ID de la pièce qui peut être une chaîne ou un nombre
 * @returns L'ID numérique ou lance une erreur si invalide
 */
function ensureNumericId(id: string | number): number {
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  
  if (isNaN(numericId)) {
    throw new Error(`ID invalide: ${id}`);
  }
  
  return numericId;
}

/**
 * Prépare les données de la pièce pour la mise à jour dans Supabase
 * @param part L'objet pièce à mettre à jour
 * @returns Les données formatées pour Supabase
 */
function preparePartDataForUpdate(part: Part): any {
  // Structure correcte pour Supabase
  return {
    name: part.name,
    part_number: part.partNumber,
    category: part.category,
    supplier: part.manufacturer,
    compatible_with: Array.isArray(part.compatibility) ? part.compatibility : [],
    quantity: parseInt(String(part.stock)),
    unit_price: parseFloat(String(part.price)),
    location: part.location,
    reorder_threshold: parseInt(String(part.reorderPoint)),
    updated_at: new Date().toISOString()
  };
}

/**
 * Met à jour une pièce existante dans la base de données
 * @param part La pièce avec les valeurs mises à jour
 * @returns Promise résolvant vers la pièce mise à jour
 */
export async function updatePart(part: Part): Promise<Part> {
  console.log('🔄 Début de la mise à jour de pièce avec ID:', part.id, 'Type:', typeof part.id, 'Données:', part);
  
  // Conversion de l'ID en nombre
  const numericId = ensureNumericId(part.id);
  
  // Préparation des données
  const partData = preparePartDataForUpdate(part);
  
  try {
    console.log('🚀 Envoi de la requête de mise à jour à Supabase pour ID:', numericId, 'Données:', partData);
    
    const { data, error } = await supabase
      .from('parts_inventory')
      .update(partData)
      .eq('id', numericId)
      .select('*')
      .single();
    
    if (error) {
      console.error('❌ Erreur Supabase lors de la mise à jour:', error);
      throw error;
    }
    
    if (!data) {
      console.error('❌ Aucune donnée retournée après la mise à jour');
      throw new Error('Aucune donnée retournée après la mise à jour');
    }
    
    console.log('✅ Mise à jour Supabase réussie, réponse:', data);
    
    // Retourner la pièce mise à jour avec tous les champs
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
      image: part.image || 'https://placehold.co/100x100/png'
    };
  } catch (err) {
    console.error('💥 Exception dans updatePart:', err);
    throw err;
  }
}
