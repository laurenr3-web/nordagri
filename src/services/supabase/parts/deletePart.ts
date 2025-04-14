
import { supabase } from '@/integrations/supabase/client';

export async function deletePart(partId: number | string): Promise<void> {
  const numericPartId = typeof partId === 'string' ? parseInt(partId, 10) : partId;

  const { error } = await supabase
    .from('parts_inventory')
    .delete()
    .eq('id', numericPartId);

  if (error) {
    console.error('Error deleting part:', error);
    throw error;
  }
}
