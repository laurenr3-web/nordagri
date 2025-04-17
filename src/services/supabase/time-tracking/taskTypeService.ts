
import { supabase } from '@/integrations/supabase/client';
import { TaskType, TimeEntryTaskType } from '@/hooks/time-tracking/types';

/**
 * Service for task type management
 */
export const taskTypeService = {
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
};
