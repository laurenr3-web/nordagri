
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { StartTimeEntryData } from '../types';

/**
 * Start a new time entry
 */
export async function startTimeEntry(userId: string, data: StartTimeEntryData): Promise<TimeEntry> {
  try {
    // Get task type ID if not provided
    if (!data.task_type_id && data.task_type) {
      const { data: taskTypeData } = await supabase
        .from('task_types')
        .select('id')
        .eq('name', data.task_type)
        .single();
      
      if (taskTypeData) {
        data.task_type_id = taskTypeData.id;
      }
    }

    // Get equipment name for reference
    let equipmentName = "";
    if (data.equipment_id) {
      const { data: equipData } = await supabase
        .from('equipment')
        .select('name')
        .eq('id', data.equipment_id)
        .single();
      
      if (equipData) {
        equipmentName = equipData.name;
      }
    }
    
    // Create a new entry in time_sessions table
    const timeEntryData = {
      user_id: userId,
      equipment_id: data.equipment_id || null,
      intervention_id: data.intervention_id || null,
      task_type_id: data.task_type_id || null,
      custom_task_type: data.custom_task_type || data.task_type,
      title: data.title || `${data.task_type} - ${new Date().toLocaleString()}`,
      notes: data.notes || '',
      status: 'active',
      start_time: new Date().toISOString(),
      location: data.location || 'Unknown',
      coordinates: data.coordinates || null,
      technician: 'Self',
      journee_id: data.journee_id || null // Use provided journee_id if available
    };
    
    const { data: result, error } = await supabase
      .from('time_sessions')
      .insert(timeEntryData)
      .select(`
        *,
        equipment:equipment_id (name)
      `)
      .single();
    
    if (error) throw error;
    
    // Transform to TimeEntry format
    const entry: TimeEntry = {
      id: result.id,
      user_id: userId,
      equipment_id: data.equipment_id,
      intervention_id: data.intervention_id,
      task_type: data.task_type,
      task_type_id: data.task_type_id,
      custom_task_type: data.custom_task_type,
      notes: data.notes,
      start_time: result.start_time,
      status: 'active',
      equipment_name: result.equipment?.name || equipmentName,
      intervention_title: result.title,
      location: data.location,
      created_at: result.created_at,
      updated_at: result.updated_at,
      journee_id: result.journee_id
    };
    
    return entry;
  } catch (error) {
    console.error("Error starting time entry:", error);
    throw error;
  }
}
