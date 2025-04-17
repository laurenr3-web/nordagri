
import { supabase } from '@/integrations/supabase/client';

/**
 * Stop a time entry
 */
export async function stopTimeEntry(entryId: string): Promise<void> {
  try {
    // Update the time_sessions entry: mark as completed and set end_time
    const { error } = await supabase
      .from('time_sessions')
      .update({
        status: 'completed',
        end_time: new Date().toISOString()
      })
      .eq('id', entryId);
    
    if (error) {
      console.error("Error in stopTimeEntry:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error stopping time entry:", error);
    throw error;
  }
}
