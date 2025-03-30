
import { supabase } from '@/integrations/supabase/client';

/**
 * Supprime une pièce de l'inventaire
 * 
 * @param partId L'identifiant de la pièce à supprimer
 * @returns Promise résolvant à un booléen indiquant le succès de l'opération
 */
export async function deletePart(partId: number | string): Promise<boolean> {
  console.log("🗑️ Suppression de la pièce ID:", partId);
  
  try {
    const { error } = await supabase
      .from('parts_inventory')
      .delete()
      .eq('id', partId);
    
    if (error) {
      console.error("❌ Erreur Supabase lors de la suppression:", error);
      
      // Messages d'erreur spécifiques
      if (error.code === '42501') {
        throw new Error("Vous n'avez pas les permissions nécessaires pour supprimer cette pièce");
      } else if (error.code === '23503') {
        throw new Error("Cette pièce est utilisée ailleurs et ne peut pas être supprimée");
      } else {
        throw new Error(`Erreur lors de la suppression: ${error.message || "Problème inconnu"}`);
      }
    }
    
    console.log("✅ Pièce supprimée avec succès");
    return true;
  } catch (err: any) {
    console.error("❌ Exception lors de la suppression de la pièce:", err);
    throw err;
  }
}
