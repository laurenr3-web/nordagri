
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { normalizePartId } from '@/services/perplexity/adapters';
import { assertIsValidId, assertIsDefined } from '@/utils/typeAssertions';

/**
 * Supprime une pièce de l'inventaire
 * 
 * @param partId L'identifiant de la pièce à supprimer
 * @returns Promise résolvant à true si la suppression a réussi
 */
export async function deletePart(partId: string | number): Promise<boolean> {
  console.log("🗑️ Tentative de suppression de la pièce ID:", partId);
  
  try {
    // Validation explicite de l'ID
    assertIsValidId(partId);
    
    // Récupération de l'ID utilisateur actuel
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error("Vous devez être connecté pour supprimer une pièce");
    }
    
    // Normaliser l'ID au format numérique
    const numericId = normalizePartId(partId);
    
    // Vérifier si l'utilisateur est propriétaire de la pièce
    const { data: part, error: partError } = await supabase
      .from('parts_inventory')
      .select('owner_id')
      .eq('id', numericId)
      .single();
    
    if (partError) {
      throw new Error(`Erreur lors de la vérification de la pièce: ${partError.message}`);
    }
      
    // Si la pièce n'a pas de propriétaire ou si l'utilisateur est le propriétaire
    if (part && (part.owner_id === userId || part.owner_id === null)) {
      // Suppression avec le bon type d'ID
      const { error } = await supabase
        .from('parts_inventory')
        .delete()
        .eq('id', numericId);
        
      if (error) {
        console.error("❌ Erreur lors de la suppression:", error);
        
        // Analyse détaillée des erreurs
        if (error.code === '23503') {
          throw new Error("Impossible de supprimer cette pièce car elle est utilisée ailleurs");
        } else if (error.code === '42501') {
          throw new Error("Vous n'avez pas les permissions nécessaires pour supprimer cette pièce");
        } else {
          throw new Error(`Erreur lors de la suppression: ${error.message || "Problème inconnu"}`);
        }
      }
      
      console.log("✅ Pièce supprimée avec succès");
      return true;
    } else {
      throw new Error("Vous n'êtes pas autorisé à supprimer cette pièce");
    }
  } catch (error: unknown) {
    console.error("❌ Exception lors de la suppression:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Une erreur inconnue est survenue lors de la suppression");
    }
  }
}
