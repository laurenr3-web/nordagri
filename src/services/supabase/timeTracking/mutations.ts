
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry, TimeEntryStatus, TimeEntryTaskType } from '@/hooks/time-tracking/types';

export async function startTimeEntry(userId: string, data: {
  equipment_id?: number;
  intervention_id?: number;
  task_type?: string;
  task_type_id?: string;
  title?: string;
  notes?: string;
  location?: string;
}): Promise<TimeEntry> {
  try {
    // Validate task type ID
    if (!data.task_type_id) {
      throw new Error("Task type is required");
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
    
    // Get task type name
    const { data: taskTypeData } = await supabase
      .from('task_types')
      .select('name')
      .eq('id', data.task_type_id)
      .single();
      
    // Use a type assertion here to match the required TimeEntryTaskType
    const taskTypeName = (taskTypeData?.name || 'maintenance') as TimeEntryTaskType;
    
    // Create a new entry in interventions table
    const timeEntryData = {
      owner_id: userId,
      equipment_id: data.equipment_id || null,
      equipment: equipmentName,
      title: data.title || `${taskTypeName} - ${new Date().toLocaleString()}`,
      description: data.notes || '',
      status: 'active',
      date: new Date().toISOString(),
      location: data.location || 'Unknown',
      priority: 'medium',
      technician: 'Self',
      task_type_id: data.task_type_id,
      task_type: taskTypeName
    };
    
    const { data: result, error } = await supabase
      .from('interventions')
      .insert(timeEntryData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Transform to TimeEntry format
    const entry: TimeEntry = {
      id: result.id.toString(),
      user_id: userId,
      equipment_id: data.equipment_id,
      intervention_id: data.intervention_id,
      task_type_id: data.task_type_id,
      task_type: taskTypeName,
      notes: data.notes,
      start_time: result.date,
      status: 'active',
      equipment_name: result.equipment,
      intervention_title: result.title,
      created_at: result.created_at,
      updated_at: result.updated_at
    };
    
    return entry;
  } catch (error) {
    console.error("Error starting time entry:", error);
    throw error;
  }
}

export async function stopTimeEntry(entryId: string): Promise<void> {
  try {
    const { data: entry } = await supabase
      .from('interventions')
      .select('date')
      .eq('id', parseInt(entryId, 10))
      .single();
    
    if (!entry) throw new Error('Entry not found');
    
    const startTime = new Date(entry.date).getTime();
    const endTime = new Date().getTime();
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);
    
    const { error } = await supabase
      .from('interventions')
      .update({
        status: 'completed',
        duration: durationHours
      })
      .eq('id', parseInt(entryId, 10));
    
    if (error) throw error;
  } catch (error) {
    console.error("Error stopping time entry:", error);
    throw error;
  }
}

export async function pauseTimeEntry(entryId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('interventions')
      .update({
        status: 'paused'
      })
      .eq('id', parseInt(entryId, 10));
    
    if (error) throw error;
  } catch (error) {
    console.error("Error pausing time entry:", error);
    throw error;
  }
}

export async function resumeTimeEntry(entryId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('interventions')
      .update({
        status: 'active'
      })
      .eq('id', parseInt(entryId, 10));
    
    if (error) throw error;
  } catch (error) {
    console.error("Error resuming time entry:", error);
    throw error;
  }
}

export async function updateTimeEntry(entryId: string, data: Partial<TimeEntry>): Promise<void> {
  try {
    const updateData: any = {};
    
    if (data.notes) updateData.description = data.notes;
    if (data.status) updateData.status = data.status;
    if (data.equipment_id) updateData.equipment_id = data.equipment_id;
    if (data.end_time && data.start_time) {
      const startTime = new Date(data.start_time).getTime();
      const endTime = new Date(data.end_time).getTime();
      updateData.duration = (endTime - startTime) / (1000 * 60 * 60);
    }
    
    const { error } = await supabase
      .from('interventions')
      .update(updateData)
      .eq('id', parseInt(entryId, 10));
    
    if (error) throw error;
  } catch (error) {
    console.error("Error updating time entry:", error);
    throw error;
  }
}

export async function deleteTimeEntry(entryId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('interventions')
      .delete()
      .eq('id', parseInt(entryId, 10));
    
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting time entry:", error);
    throw error;
  }
}
