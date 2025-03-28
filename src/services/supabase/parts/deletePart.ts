
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Supprime une pièce de l'inventaire
 * 
 * @param partId L'identifiant de la pièce à supprimer
 * @returns Promise résolvant à true si la suppression a réussi
 */
export async function deletePart(partId: string | number): Promise<boolean> {
  console.log("🗑️ Tentative de suppression de la pièce ID:", partId);
  
  try {
    // Vérification si l'ID est une chaîne numérique
    if (typeof partId === 'string' && !isNaN(Number(partId))) {
      partId = Number(partId);
    }
    
    // Suppression avec le bon type d'ID
    const { error } = await supabase
      .from('parts_inventory')
      .delete()
      .eq('id', partId);
      
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
  } catch (error: any) {
    console.error("❌ Exception lors de la suppression:", error);
    throw error;
  }
}
