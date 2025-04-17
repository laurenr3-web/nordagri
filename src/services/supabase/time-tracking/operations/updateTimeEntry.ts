
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry, TimeEntryStatus, TimeEntryTaskType } from '@/hooks/time-tracking/types';

/**
 * Update a time entry with new data
 */
export async function updateTimeEntry(
  entryId: string,
  updateData: Partial<TimeEntry>
): Promise<TimeEntry> {
  try {
    // Si nous avons un custom_task_type mais pas de task_type_id, 
    // essayons de déterminer le task_type_id automatiquement
    if (updateData.custom_task_type && !updateData.task_type_id) {
      const { data: taskTypes } = await supabase
        .from('task_types')
        .select('id, name');
        
      if (taskTypes) {
        const matchingType = taskTypes.find(
          type => type.name.toLowerCase() === updateData.custom_task_type?.toLowerCase()
        );
        
        if (matchingType) {
          updateData.task_type_id = matchingType.id;
        }
      }
    }
    
    // Préparer les données à mettre à jour
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    // Mise à jour dans la base de données
    const { data, error } = await supabase
      .from('time_sessions')
      .update(dataToUpdate)
      .eq('id', entryId)
      .select(`
        *,
        equipment:equipment_id (name)
      `)
      .single();
    
    if (error) throw error;
    
    if (!data) throw new Error("Failed to update time entry");
    
    // Ensure we have valid TimeEntryTaskType
    let taskType: TimeEntryTaskType = 'maintenance';
    if (data.custom_task_type) {
      // Try to map custom task type to a known type
      const knownTypes: TimeEntryTaskType[] = ['maintenance', 'repair', 'inspection', 'operation'];
      const normalizedType = data.custom_task_type.toLowerCase();
      if (knownTypes.includes(normalizedType as TimeEntryTaskType)) {
        taskType = normalizedType as TimeEntryTaskType;
      }
    }
    
    // Ensure we have valid TimeEntryStatus
    let status: TimeEntryStatus = 'completed'; // Default fallback
    if (data.status === 'active' || data.status === 'paused' || 
        data.status === 'completed' || data.status === 'disputed') {
      status = data.status as TimeEntryStatus;
    }
    
    // Formater la réponse
    const updatedEntry: TimeEntry = {
      id: data.id,
      user_id: data.user_id,
      owner_name: data.technician || 'User',
      user_name: data.technician || 'User',
      equipment_id: data.equipment_id,
      intervention_id: data.intervention_id,
      task_type: taskType,
      task_type_id: data.task_type_id,
      custom_task_type: data.custom_task_type,
      start_time: data.start_time,
      end_time: data.end_time,
      status: status,
      equipment_name: data.equipment?.name || 'Unknown Equipment',
      intervention_title: data.title,
      notes: data.notes,
      location: data.location,
      created_at: data.created_at,
      updated_at: data.updated_at,
      journee_id: data.journee_id
    };
    
    return updatedEntry;
  } catch (error) {
    console.error("Error updating time entry:", error);
    throw error;
  }
}
