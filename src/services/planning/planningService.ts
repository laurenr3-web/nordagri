
import { supabase } from '@/integrations/supabase/client';

export type PlanningCategory = 'animaux' | 'champs' | 'alimentation' | 'equipement' | 'batiment' | 'administration' | 'autre';
export type PlanningStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type PlanningPriority = 'critical' | 'important' | 'todo';

export interface PlanningTask {
  id: string;
  farm_id: string;
  title: string;
  category: PlanningCategory;
  status: PlanningStatus;
  manual_priority: PlanningPriority | null;
  computed_priority: PlanningPriority;
  due_date: string;
  assigned_to: string | null;
  notes: string | null;
  equipment_id: number | null;
  field_name: string | null;
  building_name: string | null;
  animal_group: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_recurring: boolean;
  recurrence_type: 'daily' | 'weekly' | 'custom' | null;
  recurrence_days: number[] | null;
  // Joined / computed
  team_member_name?: string;
  // For recurring: virtual occurrence date & completion status
  _occurrence_date?: string;
  _is_completed_today?: boolean;
}

export interface CategoryImportance {
  id: string;
  farm_id: string;
  category: PlanningCategory;
  importance: PlanningPriority;
}

export const planningService = {
  async ensureDefaults(farmId: string) {
    await supabase.rpc('ensure_default_category_importance', { _farm_id: farmId });
  },

  async getCategoryImportance(farmId: string): Promise<CategoryImportance[]> {
    const { data, error } = await supabase
      .from('planning_category_importance')
      .select('*')
      .eq('farm_id', farmId);
    if (error) throw error;
    return (data || []) as unknown as CategoryImportance[];
  },

  async updateCategoryImportance(id: string, importance: PlanningPriority) {
    const { error } = await supabase
      .from('planning_category_importance')
      .update({ importance })
      .eq('id', id);
    if (error) throw error;
  },

  async getTasks(farmId: string, startDate?: string, endDate?: string): Promise<PlanningTask[]> {
    let query = supabase
      .from('planning_tasks')
      .select('*')
      .eq('farm_id', farmId)
      .order('due_date', { ascending: true });

    if (startDate) query = query.gte('due_date', startDate);
    if (endDate) query = query.lte('due_date', endDate);

    const { data, error } = await query;
    if (error) throw error;

    return ((data || []) as any[]).map(t => ({
      ...t,
      team_member_name: null,
    }));
  },

  async addTask(task: {
    farm_id: string;
    title: string;
    category: PlanningCategory;
    due_date: string;
    computed_priority: PlanningPriority;
    created_by: string;
    manual_priority?: PlanningPriority | null;
    assigned_to?: string | null;
    notes?: string | null;
    equipment_id?: number | null;
    field_name?: string | null;
    building_name?: string | null;
    animal_group?: string | null;
    is_recurring?: boolean;
    recurrence_type?: string | null;
    recurrence_days?: number[] | null;
  }): Promise<PlanningTask> {
    const { data, error } = await supabase
      .from('planning_tasks')
      .insert(task)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as PlanningTask;
  },

  async getCompletions(taskIds: string[], startDate: string, endDate: string) {
    if (taskIds.length === 0) return [];
    const { data, error } = await supabase
      .from('planning_task_completions')
      .select('*')
      .in('task_id', taskIds)
      .gte('completion_date', startDate)
      .lte('completion_date', endDate);
    if (error) throw error;
    return data || [];
  },

  async markRecurringComplete(taskId: string, date: string, userId: string) {
    const { error } = await supabase
      .from('planning_task_completions')
      .upsert({ task_id: taskId, completion_date: date, completed_by: userId }, { onConflict: 'task_id,completion_date' });
    if (error) throw error;
  },

  async unmarkRecurringComplete(taskId: string, date: string) {
    const { error } = await supabase
      .from('planning_task_completions')
      .delete()
      .eq('task_id', taskId)
      .eq('completion_date', date);
    if (error) throw error;
  },

  async updateTaskStatus(id: string, status: PlanningStatus) {
    const { error } = await supabase
      .from('planning_tasks')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  async updateTask(id: string, updates: Partial<PlanningTask>) {
    const { error } = await supabase
      .from('planning_tasks')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async getOverdueTasks(farmId: string, today: string): Promise<PlanningTask[]> {
    const { data, error } = await supabase
      .from('planning_tasks')
      .select('*')
      .eq('farm_id', farmId)
      .lt('due_date', today)
      .neq('status', 'done')
      .eq('is_recurring', false)
      .order('due_date', { ascending: true });
    if (error) throw error;
    return ((data || []) as any[]).map(t => ({ ...t, team_member_name: null }));
  },

  async deleteTask(id: string) {
    const { error } = await supabase
      .from('planning_tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async postponeTask(id: string, newDate: string) {
    const { error } = await supabase
      .from('planning_tasks')
      .update({ due_date: newDate, status: 'todo' as PlanningStatus })
      .eq('id', id);
    if (error) throw error;
  },
};
