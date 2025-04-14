
import { supabase } from '@/integrations/supabase/client';

export async function deletePart(partId: number | string): Promise<void> {
  const { error } = await supabase
    .from('parts_inventory')
    .delete()
    .eq('id', partId);

  if (error) {
    console.error('Error deleting part:', error);
    throw error;
  }
}
