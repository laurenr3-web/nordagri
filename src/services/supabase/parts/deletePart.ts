
import { supabase } from '@/integrations/supabase/client';

export async function deletePart(partId: number | string): Promise<void> {
  console.log('🗑️ Deleting part with ID:', partId);
  
  if (typeof partId === 'string' && isNaN(Number(partId))) {
    // If it's a non-numeric string ID (like a UUID)
    throw new Error('Invalid part ID format for this database');
  }
  
  const { error } = await supabase
    .from('parts_inventory')
    .delete()
    .eq('id', partId);
  
  if (error) {
    console.error('Error deleting part:', error);
    throw error;
  }
}
