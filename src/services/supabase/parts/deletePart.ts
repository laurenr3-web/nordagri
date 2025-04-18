
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
  // Convert string IDs to numbers if necessary
  const numericPartIds = partIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
  
  const { error } = await supabase
    .from('parts_inventory')
    .delete()
    .in('id', numericPartIds);

  if (error) {
    console.error('Error deleting multiple parts:', error);
    throw error;
  }
}
