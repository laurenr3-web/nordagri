
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ensureNumericId } from '@/utils/typeAdapters';

export async function deletePart(partId: string | number) {
  try {
    // Utilisation de notre fonction d'adaptation pour normaliser l'ID
    const numericId = ensureNumericId(partId);
    
    const { error } = await supabase
      .from('parts_inventory')
      .delete()
      .eq('id', numericId);

    if (error) throw error;

    toast.success('Pièce supprimée avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la pièce:', error);
    toast.error(`Erreur lors de la suppression: ${error.message}`);
    return false;
  }
}
