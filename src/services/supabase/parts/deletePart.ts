
import { supabase } from '@/integrations/supabase/client';

/**
 * Supprime définitivement une pièce de la base de données par ID
 * 
 * @param partId L'identifiant de la pièce à supprimer (string ou number)
 * @returns Promise résolvant à void en cas de succès ou rejetant avec une erreur
 */
export async function deletePart(partId: number | string): Promise<void> {
  console.log('🗑️ Début de la suppression de pièce avec ID:', partId);
  
  try {
    // Normalisation de l'ID en fonction du type
    let normalizedId: number | string = partId;
    
    // Si l'ID est une chaîne qui peut être convertie en nombre, le faire
    if (typeof partId === 'string' && !isNaN(Number(partId))) {
      normalizedId = Number(partId);
      console.log('ID converti en nombre:', normalizedId);
    }
    
    // Vérification que l'ID est valide
    if ((typeof normalizedId === 'string' && normalizedId.trim() === '') || 
        (typeof normalizedId === 'number' && !isFinite(normalizedId))) {
      const error = new Error("ID de pièce invalide pour la suppression");
      console.error('❌ Validation échouée:', error);
      throw error;
    }
    
    console.log(`Exécution de la requête de suppression avec ID ${normalizedId} (type: ${typeof normalizedId})`);
    
    // Exécution de la requête avec analyse complète des résultats
    const { error, count, status } = await supabase
      .from('parts_inventory')
      .delete()
      .eq('id', normalizedId)
      .select('count');
    
    if (error) {
      console.error('❌ Erreur Supabase:', error);
      console.error('Code de statut HTTP:', status);
      
      // Messages d'erreur plus détaillés et descriptifs
      if (error.code === '23503') {
        throw new Error("Cette pièce est référencée par d'autres éléments et ne peut pas être supprimée");
      } else if (error.code === '42501') {
        throw new Error("Permissions insuffisantes: vous n'avez pas les droits nécessaires pour supprimer cette pièce");
      } else if (error.code === '22P02') {
        throw new Error("Format d'identifiant invalide. Veuillez réessayer ou contacter le support");
      } else {
        throw new Error(`Erreur lors de la suppression: ${error.message || "Problème inconnu"}`);
      }
    }
    
    // Si aucune ligne n'a été supprimée, c'est que la pièce n'existe pas
    if (count === 0) {
      const notFoundError = new Error("Aucune pièce trouvée avec cet identifiant");
      console.warn('⚠️ Suppression sans effet:', notFoundError.message);
      throw notFoundError;
    }
    
    console.log('✅ Suppression réussie');
  } catch (err: any) {
    console.error('❌ Exception lors de la suppression:', err);
    
    // Si l'erreur vient de Supabase, elle est déjà formatée, sinon on l'enveloppe
    if (err.code && err.message) {
      throw err;
    } else {
      throw new Error(err.message || "Une erreur est survenue lors de la suppression de la pièce");
    }
  }
}
