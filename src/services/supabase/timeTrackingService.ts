
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry, TimeEntryTaskType } from '@/hooks/time-tracking/types';

class TimeTrackingService {
  async getActiveTimeEntry(userId: string): Promise<TimeEntry | null> {
    try {
      const { data, error } = await supabase
        .from('time_sessions')
        .select(`
          id,
          user_id,
          owner_name,
          equipment_id,
          equipment:equipment_id (name),
          custom_task_type,
          start_time,
          end_time,
          status,
          notes
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
        
      if (error) {
        // Check if there's data in local cache
        const offlineData = localStorage.getItem('offline_active_time_entry');
        if (offlineData) {
          return JSON.parse(offlineData);
        }
        return null;
      }
      
      return data as TimeEntry;
    } catch (error) {
      console.error("Error in getActiveTimeEntry:", error);
      return null;
    }
  }
  
  async getTimeEntries(params: {
    userId: string;
    startDate?: Date;
    endDate?: Date;
    equipmentId?: number;
    interventionId?: number;
    taskType?: TimeEntryTaskType;
    status?: string;
  }): Promise<TimeEntry[]> {
    try {
      // Create the query
      let query = supabase
        .from('time_sessions')
        .select(`
          *,
          equipment:equipment_id (name)
        `)
        .eq('user_id', params.userId);
      
      // Apply filters
      if (params.startDate) {
        query = query.gte('start_time', params.startDate.toISOString());
      }
      
      if (params.endDate) {
        query = query.lte('start_time', params.endDate.toISOString());
      }
      
      if (params.equipmentId && params.equipmentId !== 0) {
        query = query.eq('equipment_id', params.equipmentId);
      }
      
      if (params.interventionId) {
        query = query.eq('intervention_id', params.interventionId);
      }
      
      if (params.taskType) {
        query = query.eq('custom_task_type', params.taskType);
      }
      
      if (params.status) {
        query = query.eq('status', params.status);
      }
      
      // Execute the query
      const { data, error } = await query.order('start_time', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Format and return the data
      return (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        owner_name: item.technician || 'User',
        equipment_id: item.equipment_id,
        equipment_name: item.equipment?.name || 'Unknown Equipment',
        task_type: (item.custom_task_type as TimeEntryTaskType) || 'maintenance',
        start_time: item.start_time,
        end_time: item.end_time,
        status: item.status,
        notes: item.notes,
        duration: item.duration,
        current_duration: '00:00:00',
        location: item.location,
        intervention_title: item.title,
        intervention_id: item.intervention_id,
        user_name: item.technician || 'User',
        created_at: item.created_at,
        updated_at: item.updated_at,
        task_type_id: item.task_type_id,
        custom_task_type: item.custom_task_type,
        journee_id: item.journee_id
      } as TimeEntry));
    } catch (error) {
      console.error("Error in getTimeEntries:", error);
      return [];
    }
  }

  async startTimeEntry(data: Partial<TimeEntry>): Promise<TimeEntry | null> {
    try {
      // If offline, store locally
      if (!navigator.onLine) {
        const offlineEntry = {
          ...data,
          id: `offline_${Date.now()}`,
          start_time: new Date().toISOString(),
          status: 'active',
          offline: true
        };
        
        localStorage.setItem('offline_active_time_entry', JSON.stringify(offlineEntry));
        localStorage.setItem(`offline_time_sessions_${offlineEntry.id}`, JSON.stringify(offlineEntry));
        
        // Add to list of sessions to sync
        const pendingSessions = JSON.parse(localStorage.getItem('pending_time_sessions') || '[]');
        pendingSessions.push(offlineEntry.id);
        localStorage.setItem('pending_time_sessions', JSON.stringify(pendingSessions));
        
        return offlineEntry as TimeEntry;
      }
      
      // If online, use Supabase
      const timeEntryData = {
        user_id: data.user_id,
        equipment_id: data.equipment_id || null,
        intervention_id: data.intervention_id || null,
        task_type_id: data.task_type_id || null,
        custom_task_type: data.custom_task_type || data.task_type,
        title: data.intervention_title || `${data.task_type} - ${new Date().toLocaleString()}`,
        notes: data.notes || '',
        description: data.description || '',
        status: 'active',
        start_time: new Date().toISOString(),
        location: data.location || 'Unknown',
        technician: data.owner_name || data.user_name || 'Self',
        journee_id: data.journee_id || null,
        poste_travail: data.poste_travail || '',
      };
      
      const { data: result, error } = await supabase
        .from('time_sessions')
        .insert(timeEntryData)
        .select(`
          *,
          equipment:equipment_id (name)
        `)
        .single();
      
      if (error) {
        console.error("Error starting time entry:", error);
        return null;
      }
      
      return {
        id: result.id,
        user_id: result.user_id,
        equipment_id: result.equipment_id,
        intervention_id: result.intervention_id,
        task_type: (result.custom_task_type as TimeEntryTaskType) || 'maintenance',
        task_type_id: result.task_type_id,
        custom_task_type: result.custom_task_type,
        notes: result.notes,
        description: result.description,
        start_time: result.start_time,
        status: result.status,
        equipment_name: result.equipment?.name || 'Unknown Equipment',
        intervention_title: result.title,
        location: result.location,
        poste_travail: result.poste_travail || '',
        created_at: result.created_at,
        updated_at: result.updated_at,
        journee_id: result.journee_id
      } as TimeEntry;
    } catch (error) {
      console.error("Error in startTimeEntry:", error);
      return null;
    }
  }

  async stopTimeEntry(timeEntryId: string): Promise<boolean> {
    try {
      // Handle offline case
      if (!navigator.onLine) {
        const offlineEntry = localStorage.getItem(`offline_time_sessions_${timeEntryId}`);
        if (offlineEntry) {
          const entry = JSON.parse(offlineEntry);
          entry.status = 'completed';
          entry.end_time = new Date().toISOString();
          
          localStorage.setItem(`offline_time_sessions_${timeEntryId}`, JSON.stringify(entry));
          localStorage.removeItem('offline_active_time_entry');
          return true;
        }
        return false;
      }
      
      // Online case
      const { error } = await supabase
        .from('time_sessions')
        .update({
          status: 'completed',
          end_time: new Date().toISOString()
        })
        .eq('id', timeEntryId);
        
      if (error) {
        console.error("Error stopping time entry:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in stopTimeEntry:", error);
      return false;
    }
  }

  async pauseTimeEntry(timeEntryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('time_sessions')
        .update({
          status: 'paused'
        })
        .eq('id', timeEntryId);
      
      if (error) {
        console.error("Error pausing time entry:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in pauseTimeEntry:", error);
      return false;
    }
  }

  async resumeTimeEntry(timeEntryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('time_sessions')
        .update({
          status: 'active'
        })
        .eq('id', timeEntryId);
      
      if (error) {
        console.error("Error resuming time entry:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in resumeTimeEntry:", error);
      return false;
    }
  }

  async deleteTimeEntry(timeEntryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('time_sessions')
        .delete()
        .eq('id', timeEntryId);
      
      if (error) {
        console.error("Error deleting time entry:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in deleteTimeEntry:", error);
      return false;
    }
  }

  async updateTimeEntry(entryId: string, data: Partial<TimeEntry>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.equipment_id !== undefined) updateData.equipment_id = data.equipment_id;
      if (data.task_type !== undefined) updateData.custom_task_type = data.task_type;
      if (data.task_type_id !== undefined) updateData.task_type_id = data.task_type_id;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.intervention_id !== undefined) updateData.intervention_id = data.intervention_id;
      if (data.journee_id !== undefined) updateData.journee_id = data.journee_id;
      if (data.description !== undefined) updateData.description = data.description;
      
      // Set end_time if provided or status is completed
      if (data.end_time) {
        updateData.end_time = data.end_time;
      } else if (data.status === 'completed' && !updateData.end_time) {
        updateData.end_time = new Date().toISOString();
      }
      
      // Always update timestamp
      updateData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('time_sessions')
        .update(updateData)
        .eq('id', entryId);
      
      if (error) {
        console.error("Error updating time entry:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in updateTimeEntry:", error);
      return false;
    }
  }

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
      
      return {
        id: data.id,
        user_id: data.user_id,
        equipment_id: data.equipment_id,
        equipment_name: data.equipment?.name || 'Unknown Equipment',
        task_type: (data.custom_task_type as TimeEntryTaskType) || 'maintenance',
        task_type_id: data.task_type_id,
        custom_task_type: data.custom_task_type,
        start_time: data.start_time,
        end_time: data.end_time,
        status: data.status,
        notes: data.notes,
        description: data.description,
        owner_name: data.technician || 'User',
        user_name: data.technician || 'User',
        intervention_id: data.intervention_id,
        intervention_title: data.title,
        location: data.location,
        created_at: data.created_at,
        updated_at: data.updated_at,
        journee_id: data.journee_id
      } as TimeEntry;
    } catch (error) {
      console.error("Error in getTimeEntryById:", error);
      return null;
    }
  }

  // Method to sync offline sessions
  async syncOfflineSessions(): Promise<boolean> {
    try {
      const pendingSessions = JSON.parse(localStorage.getItem('pending_time_sessions') || '[]');
      if (pendingSessions.length === 0) return true;
      
      for (const sessionId of pendingSessions) {
        const sessionData = localStorage.getItem(`offline_time_sessions_${sessionId}`);
        if (!sessionData) continue;
        
        const session = JSON.parse(sessionData);
        delete session.id; // Remove temporary ID
        delete session.offline; // Remove offline marker
        
        // Insert session into Supabase
        const { error } = await supabase
          .from('time_sessions')
          .insert(session);
          
        if (error) {
          console.error(`Error syncing session ${sessionId}:`, error);
          continue;
        }
        
        // Remove session from local storage
        localStorage.removeItem(`offline_time_sessions_${sessionId}`);
      }
      
      // Clear pending sessions list
      localStorage.removeItem('pending_time_sessions');
      localStorage.removeItem('offline_active_time_entry');
      
      return true;
    } catch (error) {
      console.error("Error syncing offline sessions:", error);
      return false;
    }
  }
}

export const timeTrackingService = new TimeTrackingService();
