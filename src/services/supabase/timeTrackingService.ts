import { supabase } from '@/integrations/supabase/client';
import { TimeEntry, TimeEntryTaskType, TimeEntryStatus, TimeSpentByEquipment, TaskType } from '@/hooks/time-tracking/types';
import { convertDatesToISOStrings } from '@/data/adapters/supabase/utils';

/**
 * Service for time tracking management using the new time_sessions table
 */
export const timeTrackingService = {
  /**
   * Get all task types
   */
  async getTaskTypes(): Promise<TaskType[]> {
    try {
      const { data, error } = await supabase
        .from('task_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Map the response to ensure it matches TaskType interface
      return (data || []).map(item => ({
        id: item.id,
        name: item.name as TimeEntryTaskType,
        affecte_compteur: item.affecte_compteur,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error("Error fetching task types:", error);
      throw error;
    }
  },
  
  /**
   * Get the active time entry for a user
   */
  async getActiveTimeEntry(userId: string): Promise<TimeEntry | null> {
    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await supabase
        .from('time_sessions')
        .select(`
          *,
          equipment:equipment_id (name)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('start_time', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        const userName = userProfile ? 
          `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : 
          'Utilisateur';

        return {
          id: data.id,
          user_id: userId,
          owner_name: userName,
          user_name: userName,
          equipment_id: data.equipment_id,
          task_type: data.custom_task_type as TimeEntryTaskType || 'maintenance',
          task_type_id: data.task_type_id,
          custom_task_type: data.custom_task_type,
          start_time: data.start_time,
          end_time: data.end_time,
          status: data.status as TimeEntryStatus,
          equipment_name: data.equipment?.name || 'Unknown Equipment',
          intervention_title: data.title,
          notes: data.notes,
          location: data.location,
          created_at: data.created_at,
          updated_at: data.updated_at,
          current_duration: '00:00:00'
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching active time entry:", error);
      throw error;
    }
  },
  
  /**
   * Get time entries based on filters
   */
  async getTimeEntries(filters: {
    userId: string;
    startDate?: Date;
    endDate?: Date;
    equipmentId?: number;
    interventionId?: number;
    taskType?: TimeEntryTaskType;
    status?: TimeEntryStatus;
  }): Promise<TimeEntry[]> {
    try {
      // Create query
      let query = supabase
        .from('time_sessions')
        .select(`
          *,
          equipment:equipment_id (name)
        `)
        .eq('user_id', filters.userId);
      
      // Apply optional filters
      if (filters.startDate) {
        query = query.gte('start_time', filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        query = query.lte('start_time', filters.endDate.toISOString());
      }
      
      if (filters.equipmentId && filters.equipmentId !== 0) {
        query = query.eq('equipment_id', filters.equipmentId);
      }
      
      if (filters.interventionId) {
        query = query.eq('intervention_id', filters.interventionId);
      }
      
      if (filters.taskType) {
        query = query.eq('custom_task_type', filters.taskType);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      // Execute query
      const { data, error } = await query.order('start_time', { ascending: false });
      
      if (error) throw error;
      
      // Transform to TimeEntry format
      return (data || []).map(item => {
        return {
          id: item.id,
          user_id: item.user_id,
          owner_name: item.technician || 'User',
          user_name: item.technician || 'User',
          equipment_id: item.equipment_id,
          intervention_id: item.intervention_id,
          task_type: item.custom_task_type as TimeEntryTaskType || 'maintenance',
          task_type_id: item.task_type_id,
          custom_task_type: item.custom_task_type,
          start_time: item.start_time,
          end_time: item.end_time,
          status: item.status as TimeEntryStatus,
          equipment_name: item.equipment?.name || 'Unknown Equipment',
          intervention_title: item.title,
          notes: item.notes,
          location: item.location,
          created_at: item.created_at,
          updated_at: item.updated_at
        } as TimeEntry;
      });
    } catch (error) {
      console.error("Error fetching time entries:", error);
      throw error;
    }
  },
  
  /**
   * Get a specific time entry by ID
   */
  async getTimeEntryById(entryId: string): Promise<TimeEntry | null> {
    try {
      const { data, error } = await supabase
        .from('time_sessions')
        .select(`
          *,
          equipment:equipment_id (name)
        `)
        .eq('id', entryId)
        .single();
      
      if (error) {
        console.error("Error getting time entry by ID:", error);
        return null;
      }
      
      if (!data) return null;
      
      // Transform to TimeEntry format
      return {
        id: data.id,
        user_id: data.user_id,
        owner_name: data.technician || 'User',
        user_name: data.technician || 'User',
        equipment_id: data.equipment_id,
        intervention_id: data.intervention_id,
        task_type: data.custom_task_type as TimeEntryTaskType || 'maintenance',
        task_type_id: data.task_type_id,
        custom_task_type: data.custom_task_type,
        start_time: data.start_time,
        end_time: data.end_time,
        status: data.status as TimeEntryStatus,
        equipment_name: data.equipment?.name || 'Unknown Equipment',
        intervention_title: data.title,
        notes: data.notes,
        location: data.location,
        created_at: data.created_at,
        updated_at: data.updated_at,
        journee_id: data.journee_id
      } as TimeEntry;
    } catch (error) {
      console.error("Error fetching time entry by ID:", error);
      return null;
    }
  },
  
  /**
   * Get time entries for a specific intervention
   */
  async getTimeEntriesByIntervention(interventionId: number): Promise<TimeEntry[]> {
    try {
      const { data, error } = await supabase
        .from('time_sessions')
        .select(`
          *,
          equipment:equipment_id (name)
        `)
        .eq('intervention_id', interventionId)
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      
      // Transform to TimeEntry format
      return (data || []).map(item => {
        return {
          id: item.id,
          user_id: item.user_id,
          owner_name: item.technician || 'User',
          user_name: item.technician || 'User',
          equipment_id: item.equipment_id,
          intervention_id: item.intervention_id,
          task_type: item.custom_task_type as TimeEntryTaskType || 'maintenance',
          task_type_id: item.task_type_id,
          custom_task_type: item.custom_task_type,
          start_time: item.start_time,
          end_time: item.end_time,
          status: item.status as TimeEntryStatus,
          equipment_name: item.equipment?.name || 'Unknown Equipment',
          intervention_title: item.title,
          notes: item.notes,
          location: item.location,
          created_at: item.created_at,
          updated_at: item.updated_at,
          journee_id: item.journee_id
        } as TimeEntry;
      });
    } catch (error) {
      console.error("Error getting time entries by intervention:", error);
      throw error;
    }
  },
  
  /**
   * Get time entries for a specific day (using journee_id)
   */
  async getTimeEntriesByJourneeId(journeeId: string): Promise<TimeEntry[]> {
    try {
      const { data, error } = await supabase
        .from('time_sessions')
        .select(`
          *,
          equipment:equipment_id (name)
        `)
        .eq('journee_id', journeeId)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      // Transform to TimeEntry format
      return (data || []).map(item => {
        return {
          id: item.id,
          user_id: item.user_id,
          owner_name: item.technician || 'User',
          user_name: item.technician || 'User',
          equipment_id: item.equipment_id,
          intervention_id: item.intervention_id,
          task_type: item.custom_task_type as TimeEntryTaskType || 'maintenance',
          task_type_id: item.task_type_id,
          custom_task_type: item.custom_task_type,
          start_time: item.start_time,
          end_time: item.end_time,
          status: item.status as TimeEntryStatus,
          equipment_name: item.equipment?.name || 'Unknown Equipment',
          intervention_title: item.title,
          notes: item.notes,
          location: item.location,
          created_at: item.created_at,
          updated_at: item.updated_at,
          journee_id: item.journee_id
        } as TimeEntry;
      });
    } catch (error) {
      console.error("Error getting time entries by journee_id:", error);
      throw error;
    }
  },
  
  /**
   * Get time spent by equipment
   */
  async getTimeSpentByEquipment(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TimeSpentByEquipment[]> {
    try {
      // Create query for time_sessions with duration
      let query = supabase
        .from('time_sessions')
        .select(`
          equipment_id,
          equipment:equipment_id (name),
          duration
        `)
        .eq('user_id', userId)
        .not('duration', 'is', null);
      
      if (startDate) query = query.gte('start_time', startDate.toISOString());
      if (endDate) query = query.lte('start_time', endDate.toISOString());
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Process data to calculate time spent by equipment
      const equipmentMap = new Map<number, { name: string, minutes: number }>();
      
      data?.forEach(item => {
        if (item.equipment_id && item.duration) {
          const id = item.equipment_id;
          const current = equipmentMap.get(id) || { name: item.equipment?.name || 'Unknown', minutes: 0 };
          current.minutes += item.duration * 60; // Convert hours to minutes
          equipmentMap.set(id, current);
        }
      });
      
      // Convert map to array
      return Array.from(equipmentMap.entries()).map(([equipment_id, data]) => ({
        equipment_id,
        equipment_name: data.name,
        total_minutes: data.minutes
      }));
    } catch (error) {
      console.error("Error getting time spent by equipment:", error);
      throw error;
    }
  },
  
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
  async startTimeEntry(userId: string, data: {
    equipment_id?: number;
    intervention_id?: number;
    task_type: TimeEntryTaskType;
    task_type_id?: string;
    custom_task_type?: string;
    title?: string;
    notes?: string;
    location?: string;
    coordinates?: { lat: number; lng: number };
    journee_id?: string; // Added support for journee_id
  }): Promise<TimeEntry> {
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
