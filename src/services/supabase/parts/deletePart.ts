
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function deletePart(partId: string | number) {
  try {
    const { error } = await supabase
      .from('parts')
      .delete()
      .eq('id', partId);

    if (error) throw error;

    toast.success('Pièce supprimée avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la pièce:', error);
    toast.error(`Erreur lors de la suppression: ${error.message}`);
    return false;
  }
}
