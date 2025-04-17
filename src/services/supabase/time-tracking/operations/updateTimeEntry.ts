
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/hooks/time-tracking/types';

/**
 * Update a time entry
 */
export async function updateTimeEntry(entryId: string, data: Partial<TimeEntry>): Promise<void> {
  try {
    // Convert TimeEntry data to time_sessions format
    const updateData: any = {};
    
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.equipment_id !== undefined) updateData.equipment_id = data.equipment_id;
    if (data.task_type !== undefined) updateData.custom_task_type = data.task_type;
    if (data.task_type_id !== undefined) updateData.task_type_id = data.task_type_id;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.intervention_id !== undefined) updateData.intervention_id = data.intervention_id;
    if (data.journee_id !== undefined) updateData.journee_id = data.journee_id;
    
    // Set end_time if provided or if status is being set to completed
    if (data.end_time) {
      updateData.end_time = data.end_time;
    } else if (data.status === 'completed' && !updateData.end_time) {
      updateData.end_time = new Date().toISOString();
    }
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('time_sessions')
      .update(updateData)
      .eq('id', entryId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error updating time entry:", error);
    throw error;
  }
}
