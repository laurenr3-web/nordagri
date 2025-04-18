
import { supabase } from '@/integrations/supabase/client';
import { ensureNumberId } from '@/utils/typeGuards';

export async function deletePart(partId: number | string): Promise<void> {
  const numericId = ensureNumberId(partId);
  
  const { error } = await supabase
    .from('parts_inventory')
    .delete()
    .eq('id', numericId);

  if (error) {
    console.error('Error deleting part:', error);
    throw error;
  }
}

export async function deleteMultipleParts(partIds: (number | string)[]): Promise<void> {
  // Convert all IDs to numbers
  const numericIds = partIds.map(id => ensureNumberId(id));
  
  const { error } = await supabase
    .from('parts_inventory')
    .delete()
    .in('id', numericIds);

  if (error) {
    console.error('Error deleting multiple parts:', error);
    throw error;
  }
}
