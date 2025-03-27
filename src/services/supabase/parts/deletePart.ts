
import { supabase } from '@/integrations/supabase/client';

export async function deletePart(partId: number): Promise<void> {
  console.log('🗑️ Deleting part with ID:', partId);
  const { error } = await supabase
    .from('parts_inventory')
    .delete()
    .eq('id', partId);
  
  if (error) {
    console.error('Error deleting part:', error);
    throw error;
  }
}
