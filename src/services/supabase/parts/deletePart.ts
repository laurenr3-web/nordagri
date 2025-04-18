
import { supabase } from '@/integrations/supabase/client';

export async function deletePart(partId: number): Promise<void> {
  const { error } = await supabase
    .from('parts_inventory')
    .delete()
    .eq('id', partId);

  if (error) {
    console.error('Error deleting part:', error);
    throw error;
  }
}

export async function deleteMultipleParts(partIds: number[]): Promise<void> {
  const { error } = await supabase
    .from('parts_inventory')
    .delete()
    .in('id', partIds);

  if (error) {
    console.error('Error deleting multiple parts:', error);
    throw error;
  }
}
