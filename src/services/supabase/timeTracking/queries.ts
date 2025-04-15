
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry, TimeEntryTaskType } from '@/hooks/time-tracking/types';
import { convertDatesToISOStrings } from '@/data/adapters/supabase/utils';

export async function getTaskTypes() {
  try {
    const { data, error } = await supabase
      .from('task_types')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
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
}

export async function getTimeEntries(filters: {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  equipmentId?: number;
  taskType?: TimeEntryTaskType;
}) {
  try {
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
    
    if (filters.startDate) {
      query = query.gte('date', filters.startDate.toISOString());
    }
    
    if (filters.endDate) {
      query = query.lte('date', filters.endDate.toISOString());
    }
    
    if (filters.equipmentId && filters.equipmentId !== 0) {
      query = query.eq('equipment_id', filters.equipmentId);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id.toString(),
      user_id: item.owner_id,
      equipment_id: item.equipment_id,
      task_type: 'maintenance',
      start_time: item.date,
      end_time: item.duration ? new Date(new Date(item.date).getTime() + item.duration * 3600000).toISOString() : null,
      notes: item.description,
      status: item.status as 'active' | 'paused' | 'completed' | 'disputed',
      equipment_name: item.equipment,
      intervention_title: item.title,
      created_at: item.created_at,
      updated_at: item.updated_at
    } as TimeEntry));
  } catch (error) {
    console.error("Error fetching time entries:", error);
    throw error;
  }
}

export async function getActiveTimeEntry(userId: string): Promise<TimeEntry | null> {
  try {
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
      .is('duration', null)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    if (data) {
      return {
        id: data.id.toString(),
        user_id: userId,
        equipment_id: data.equipment_id,
        task_type: 'maintenance',
        start_time: data.date,
        status: data.status as 'active' | 'paused' | 'completed' | 'disputed',
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
}
