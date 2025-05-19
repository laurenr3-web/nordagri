
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry, TimeEntryTaskType, TimeEntryStatus, TimeSpentByEquipment } from '@/hooks/time-tracking/types';
import { TimeEntriesFilter } from './types';

/**
 * Service for time entry queries
 */
export const timeEntryQueries = {
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
          // Fix: Access equipment name safely
          equipment_name: data.equipment?.name || 'Unknown Equipment',
          intervention_title: data.title,
          notes: data.notes,
          location: data.location,
          created_at: data.created_at,
          updated_at: data.updated_at,
          current_duration: '00:00:00',
          journee_id: data.journee_id
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
  async getTimeEntries(filters: TimeEntriesFilter): Promise<TimeEntry[]> {
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
          // Fix: Access equipment name safely
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
        // Fix: Access equipment name safely
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
          // Fix: Access equipment name safely
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
          // Fix: Access equipment name safely
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
          // Fix: Access equipment name safely
          const equipName = item.equipment?.name || 'Unknown';
          const current = equipmentMap.get(id) || { name: equipName, minutes: 0 };
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
  }
};
