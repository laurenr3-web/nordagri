
import { supabase } from '@/integrations/supabase/client';

/**
 * Resume a paused time entry
 */
export async function resumeTimeEntry(entryId: string): Promise<void> {
  try {
    // Update the time_sessions entry: mark as active
    const { error } = await supabase
      .from('time_sessions')
      .update({
        status: 'active'
      })
      .eq('id', entryId);
    
    if (error) {
      console.error("Error in resumeTimeEntry:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error resuming time entry:", error);
    throw error;
  }
}
