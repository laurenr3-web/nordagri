
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { StartTimeEntryData } from './types';

/**
 * Service for time entry operations (create, update, delete)
 */
export const timeEntryOperations = {
  /**
   * Delete a time entry
   */
  async deleteTimeEntry(entryId: string): Promise<void> {
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
  },
  
  /**
   * Start a new time entry
   */
  async startTimeEntry(userId: string, data: StartTimeEntryData): Promise<TimeEntry> {
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
  },
  
  /**
   * Stop a time entry
   */
  async stopTimeEntry(entryId: string): Promise<void> {
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
  },
  
  /**
   * Pause a time entry
   */
  async pauseTimeEntry(entryId: string): Promise<void> {
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
  },
  
  /**
   * Resume a paused time entry
   */
  async resumeTimeEntry(entryId: string): Promise<void> {
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
  },
  
  /**
   * Update a time entry
   */
  async updateTimeEntry(entryId: string, data: Partial<TimeEntry>): Promise<void> {
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
};
