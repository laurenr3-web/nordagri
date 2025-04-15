import { supabase } from '@/integrations/supabase/client';
import { TimeEntry, TimeEntryTaskType, TimeEntryStatus, TimeSpentByEquipment, TaskType } from '@/hooks/time-tracking/types';
import { convertDatesToISOStrings } from '@/data/adapters/supabase/utils';

/**
 * Service for time tracking management
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
      // Query the interventions table directly for active time entries
      const { data, error } = await supabase
        .from('interventions')
        .select(`
          id,
          equipment_id,
          title,
          description,
          date,
          status,
          equipment
        `)
        .eq('owner_id', userId)
        .eq('status', 'active')
        .is('duration', null)  // If duration is null, the entry is still ongoing
        .order('date', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is the code for "No rows returned", which is normal if no active entry
        throw error;
      }
      
      if (data) {
        // Transform data to match TimeEntry interface
        return {
          id: data.id.toString(),
          user_id: userId,
          equipment_id: data.equipment_id,
          task_type: 'maintenance' as TimeEntryTaskType, // Default
          start_time: data.date,
          status: data.status as TimeEntryStatus,
          equipment_name: data.equipment,
          intervention_title: data.title,
          created_at: data.date,
          updated_at: data.date
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
        .from('interventions')
        .select(`
          id,
          owner_id,
          equipment_id,
          equipment,
          title,
          description,
          date,
          status,
          duration,
          created_at,
          updated_at
        `)
        .eq('owner_id', filters.userId);
      
      // Apply optional filters
      if (filters.startDate) {
        query = query.gte('date', filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        query = query.lte('date', filters.endDate.toISOString());
      }
      
      if (filters.equipmentId && filters.equipmentId !== 0) {
        query = query.eq('equipment_id', filters.equipmentId);
      }
      
      // Execute query
      const { data, error } = await query.order('date', { ascending: false });
      
      if (error) throw error;
      
      // Transform to TimeEntry format
      return (data || []).map(item => {
        return {
          id: item.id.toString(),
          user_id: item.owner_id,
          equipment_id: item.equipment_id,
          task_type: 'maintenance' as TimeEntryTaskType, // Default
          start_time: item.date,
          end_time: item.duration ? new Date(new Date(item.date).getTime() + item.duration * 3600000).toISOString() : null,
          notes: item.description,
          status: item.status as TimeEntryStatus,
          equipment_name: item.equipment,
          intervention_title: item.title,
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
   * Get time spent by equipment
   */
  async getTimeSpentByEquipment(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TimeSpentByEquipment[]> {
    try {
      // Create query for interventions with duration
      let query = supabase
        .from('interventions')
        .select(`
          equipment_id,
          equipment,
          duration
        `)
        .eq('owner_id', userId)
        .not('duration', 'is', null);
      
      if (startDate) query = query.gte('date', startDate.toISOString());
      if (endDate) query = query.lte('date', endDate.toISOString());
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Process data to calculate time spent by equipment
      const equipmentMap = new Map<number, { name: string, minutes: number }>();
      
      data?.forEach(item => {
        if (item.equipment_id && item.duration) {
          const id = item.equipment_id;
          const current = equipmentMap.get(id) || { name: item.equipment || 'Unknown', minutes: 0 };
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
        .from('interventions')
        .delete()
        .eq('id', parseInt(entryId, 10));
      
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
    title?: string;
    notes?: string;
    location?: string;
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
      
      // Create a new entry in interventions table
      const timeEntryData = {
        owner_id: userId,
        equipment_id: data.equipment_id || null,
        equipment: equipmentName,
        title: data.title || `${data.task_type} - ${new Date().toLocaleString()}`,
        description: data.notes || '',
        status: 'active',
        date: new Date().toISOString(),
        location: data.location || 'Unknown',
        priority: 'medium',
        technician: 'Self',
        task_type_id: data.task_type_id,
        task_type: data.task_type
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
        task_type: data.task_type,
        task_type_id: data.task_type_id,
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
  },
  
  /**
   * Stop a time entry
   */
  async stopTimeEntry(entryId: string): Promise<void> {
    try {
      // Calculate duration from start date to now
      const { data: entry } = await supabase
        .from('interventions')
        .select('date')
        .eq('id', parseInt(entryId, 10))
        .single();
      
      if (!entry) throw new Error('Entry not found');
      
      const startTime = new Date(entry.date).getTime();
      const endTime = new Date().getTime();
      const durationHours = (endTime - startTime) / (1000 * 60 * 60);
      
      // Update the entry with end time and duration
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
  },
  
  /**
   * Pause a time entry
   */
  async pauseTimeEntry(entryId: string): Promise<void> {
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
  },
  
  /**
   * Resume a paused time entry
   */
  async resumeTimeEntry(entryId: string): Promise<void> {
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
  },
  
  /**
   * Update a time entry
   */
  async updateTimeEntry(entryId: string, data: Partial<TimeEntry>): Promise<void> {
    try {
      // Convert TimeEntry data to interventions format
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
};
