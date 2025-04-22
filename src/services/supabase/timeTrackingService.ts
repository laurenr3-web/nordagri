import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/TimeEntry';

const getTimeEntries = async (filters: any): Promise<TimeEntry[] | null> => {
  try {
    let query = supabase
      .from('time_sessions')
      .select('*')
      .order('start_time', { ascending: false });

    if (filters.equipment_id) {
      query = query.eq('equipment_id', filters.equipment_id);
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters.start_date) {
      query = query.gte('start_time', filters.start_date);
    }

    if (filters.end_date) {
      query = query.lte('start_time', filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching time entries:', error);
      return null;
    }

    return data as TimeEntry[];
  } catch (error) {
    console.error('Exception in getTimeEntries:', error);
    return null;
  }
};

const getTimeEntryById = async (id: string): Promise<TimeEntry | null> => {
  try {
    const { data, error } = await supabase
      .from('time_sessions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching time entry:', error);
      return null;
    }
    
    // Cast the data to TimeEntry to satisfy TypeScript
    return data as unknown as TimeEntry;
  } catch (error) {
    console.error('Exception in getTimeEntryById:', error);
    return null;
  }
};

const createTimeEntry = async (entry: Omit<TimeEntry, 'id'>): Promise<TimeEntry | null> => {
  try {
    const { data, error } = await supabase
      .from('time_sessions')
      .insert([entry])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating time entry:', error);
      return null;
    }

    return data as TimeEntry;
  } catch (error) {
    console.error('Exception in createTimeEntry:', error);
    return null;
  }
};

const updateTimeEntry = async (id: string, updates: Partial<TimeEntry>): Promise<TimeEntry | null> => {
  try {
    const { data, error } = await supabase
      .from('time_sessions')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating time entry:', error);
      return null;
    }

    return data as TimeEntry;
  } catch (error) {
    console.error('Exception in updateTimeEntry:', error);
    return null;
  }
};

const deleteTimeEntry = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('time_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting time entry:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception in deleteTimeEntry:', error);
    return false;
  }
};

export const timeTrackingService = {
  getTimeEntries,
  getTimeEntryById,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
};
