
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
  // Vérifier les valeurs obligatoires
  if (!part.name) {
    throw new Error('Le nom de la pièce est obligatoire');
  }
  
  if (!part.partNumber) {
    throw new Error('Le numéro de référence est obligatoire');
  }
  
  // Vérifier que les valeurs numériques sont valides
  const price = parseFloat(String(part.price));
  if (isNaN(price)) {
    throw new Error('Le prix doit être un nombre valide');
  }
  
  const stock = parseInt(String(part.stock));
  if (isNaN(stock)) {
    throw new Error('Le stock doit être un nombre entier valide');
  }
  
  const reorderPoint = parseInt(String(part.reorderPoint));
  if (isNaN(reorderPoint)) {
    throw new Error('Le point de réapprovisionnement doit être un nombre valide');
  }
  
  // Structure correcte pour Supabase
  return {
    name: part.name,
    part_number: part.partNumber,
    category: part.category,
    supplier: part.manufacturer,
    compatible_with: Array.isArray(part.compatibility) ? part.compatibility : [],
    quantity: stock,
    unit_price: price,
    location: part.location,
    reorder_threshold: reorderPoint,
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
  
  try {
    // Conversion de l'ID en nombre
    const numericId = ensureNumericId(part.id);
    
    // Préparation des données
    const partData = preparePartDataForUpdate(part);
    
    // Ajout des logs avant l'appel à Supabase
    console.log('🚀 Sending update request with data:', partData);
    
    const { data, error } = await supabase
      .from('parts_inventory')
      .update(partData)
      .eq('id', numericId)
      .select('*')
      .single();
    
    // Ajout des logs après l'appel à Supabase
    if (error) {
      console.error('❌ Supabase error during update:', error);
      console.error('Error details:', error.details);
      
      // Personnalisation des messages d'erreur
      if (error.code === '23505') {
        throw new Error('Cette référence de pièce existe déjà dans l\'inventaire');
      } else if (error.code === '23502') {
        throw new Error('Un ou plusieurs champs obligatoires sont manquants');
      } else if (error.code === '42P01') {
        throw new Error('Problème de connexion à la base de données');
      } else if (error.code === '42703') {
        throw new Error('Structure de données incorrecte');
      } else {
        throw error;
      }
    }
    
    if (!data) {
      console.error('❌ Aucune donnée retournée après la mise à jour');
      throw new Error('Aucune donnée retournée après la mise à jour. La pièce existe-t-elle?');
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
  } catch (err: any) {
    console.error('💥 Exception dans updatePart:', err);
    throw {
      message: err.message || 'Échec de la mise à jour de la pièce',
      code: err.code,
      details: err.details,
      originalError: err
    };
  }
}
