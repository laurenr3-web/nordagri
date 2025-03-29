
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function deletePart(partId: string | number) {
  try {
    // Convert string ID to number if needed
    const numericId = typeof partId === 'string' ? parseInt(partId, 10) : partId;
    
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
