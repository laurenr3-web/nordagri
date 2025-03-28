
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
    if (!part.name) {
      throw new Error("Le champ obligatoire 'name' doit être défini");
    }

    // Vérification que l'ID est un nombre pour les opérations Supabase
    // Si l'ID est une chaîne qui peut être convertie en nombre, le faire
    const partId = typeof part.id === 'string' && !isNaN(Number(part.id)) 
      ? Number(part.id) 
      : part.id;
      
    // Si après conversion ce n'est toujours pas un nombre, rejeter
    if (typeof partId !== 'number') {
      throw new Error("L'ID de la pièce doit être un nombre pour la mise à jour dans Supabase");
    }

    // Préparation des données avec correspondance exacte des noms de colonnes
    const updateData = {
      name: part.name,
      part_number: part.partNumber || '',
      category: part.category || '',
      supplier: part.manufacturer || '',
      compatible_with: Array.isArray(part.compatibility) ? part.compatibility : [],
      quantity: part.stock || 0,
      unit_price: part.price !== undefined ? part.price : 0,
      location: part.location || '',
      reorder_threshold: part.reorderPoint || 0,
      image_url: part.image || null,
      updated_at: new Date().toISOString()
    };
    
    console.log('Données envoyées à Supabase:', updateData);
    
    // Exécution de la requête avec debug complet
    const { data, error, status } = await supabase
      .from('parts_inventory')
      .update(updateData)
      .eq('id', partId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Erreur Supabase:', error);
      console.error('Code de statut HTTP:', status);
      
      // Messages d'erreur plus détaillés et descriptifs
      if (error.code === '23505') {
        throw new Error(`Référence de pièce en doublon: "${part.partNumber}" existe déjà dans la base de données`);
      } else if (error.code === '23502') {
        throw new Error("Champs obligatoires manquants: vérifiez que tous les champs requis sont remplis");
      } else if (error.code === '42703') {
        throw new Error("Structure de données incorrecte: veuillez contacter l'administrateur système");
      } else if (error.code === '42501') {
        throw new Error("Permissions insuffisantes: vous n'avez pas les droits nécessaires pour modifier cette pièce");
      } else {
        throw new Error(`Erreur lors de la mise à jour: ${error.message || "Problème inconnu"}`);
      }
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
      stock: data.quantity || 0,
      price: data.unit_price !== null ? data.unit_price : 0,
      location: data.location || '',
      reorderPoint: data.reorder_threshold || 5,
      image: data.image_url || 'https://placehold.co/100x100/png',
      reference: data.part_number || '' // Ajout du champ reference pour compatibilité
    };
  } catch (err: any) {
    console.error('Exception lors de la mise à jour:', err);
    throw err;
  }
}
