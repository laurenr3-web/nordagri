
import { supabase } from '@/integrations/supabase/client';

/**
 * Delete a time entry
 */
export async function deleteTimeEntry(entryId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('time_sessions')
      .delete()
      .eq('id', entryId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting time entry:", error);
    throw error;
  }
}
