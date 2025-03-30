
import { supabase } from '@/integrations/supabase/client';
import { ensureNumberId } from '@/utils/typeGuards';
import { checkAuthStatus } from '@/utils/authUtils';

/**
 * Supprime une pièce de l'inventaire
 * 
 * @param partId L'identifiant de la pièce à supprimer
 * @returns Promise résolvant à un booléen indiquant le succès de l'opération
 */
export async function deletePart(partId: number | string): Promise<boolean> {
  console.log("🗑️ Suppression de la pièce ID:", partId);
  
  try {
    // Vérifier l'état de l'authentification
    const authStatus = await checkAuthStatus();
    if (!authStatus.isAuthenticated) {
      throw new Error("Vous devez être connecté pour supprimer des pièces");
    }
    
    // Récupérer l'ID de l'utilisateur
    const userId = authStatus.session?.user.id;
    
    // Convertir l'ID de la pièce en nombre si nécessaire
    const numericId = ensureNumberId(partId);
    
    // Vérifier d'abord si l'utilisateur est propriétaire de la pièce
    const { data: ownershipCheck, error: ownershipError } = await supabase
      .from('parts_inventory')
      .select('id, owner_id')
      .eq('id', numericId)
      .single();
      
    if (ownershipError) {
      console.error("❌ Erreur lors de la vérification de propriété:", ownershipError);
      throw new Error("Impossible de vérifier si vous êtes propriétaire de cette pièce");
    }
    
    if (!ownershipCheck) {
      throw new Error("Cette pièce n'existe pas");
    }
    
    if (ownershipCheck.owner_id !== userId) {
      throw new Error("Vous n'êtes pas autorisé à supprimer cette pièce car vous n'en êtes pas le propriétaire");
    }
    
    // Procéder à la suppression
    const { error, data } = await supabase
      .from('parts_inventory')
      .delete()
      .eq('id', numericId)
      .select('id');
    
    if (error) {
      console.error("❌ Erreur Supabase lors de la suppression:", error);
      
      // Vérifier si c'est une erreur de RLS
      if (error.code === '42501' || error.message.includes('row-level security')) {
        throw new Error("Vous n'avez pas les permissions nécessaires pour supprimer cette pièce");
      } else if (error.code === '23503') {
        throw new Error("Cette pièce est utilisée ailleurs et ne peut pas être supprimée");
      } else {
        throw new Error(`Erreur lors de la suppression: ${error.message || "Problème inconnu"}`);
      }
    }
    
    // Si aucune donnée n'est retournée, la pièce n'existe peut-être pas
    if (!data || data.length === 0) {
      console.warn("⚠️ Aucune pièce n'a été supprimée, vérifiez l'ID:", partId);
      return false;
    }
    
    console.log("✅ Pièce supprimée avec succès");
    return true;
  } catch (err: any) {
    console.error("❌ Exception lors de la suppression de la pièce:", err);
    throw err;
  }
}
