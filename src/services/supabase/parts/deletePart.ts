
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

export async function deleteMultipleParts(partIds: (number | string)[]): Promise<void> {
  const { error } = await supabase
    .from('parts_inventory')
    .delete()
    .in('id', partIds);

  if (error) {
    console.error('Error deleting multiple parts:', error);
    throw error;
  }
}
