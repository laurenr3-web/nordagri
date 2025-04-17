
import { supabase } from '@/integrations/supabase/client';

/**
 * Pause a time entry
 */
export async function pauseTimeEntry(entryId: string): Promise<void> {
  try {
    // Update the time_sessions entry: mark as paused
    const { error } = await supabase
      .from('time_sessions')
      .update({
        status: 'paused'
      })
      .eq('id', entryId);
    
    if (error) {
      console.error("Error in pauseTimeEntry:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error pausing time entry:", error);
    throw error;
  }
}
