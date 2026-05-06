import { supabase } from '@/integrations/supabase/client';
import type { PlannedShift, UpsertPlannedShiftInput } from '@/types/PlannedShift';
import type { WorkShift } from '@/services/work-shifts/types';

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const plannedShiftsService = {
  async listByDay(farmId: string, date: string): Promise<PlannedShift[]> {
    const { data, error } = await supabase
      .from('planned_shifts' as any)
      .select('*')
      .eq('farm_id', farmId)
      .eq('shift_date', date)
      .order('start_time', { ascending: true, nullsFirst: true });
    if (error) throw error;
    return (data || []) as unknown as PlannedShift[];
  },

  async listByWeek(farmId: string, weekStartDate: string): Promise<PlannedShift[]> {
    const end = addDays(weekStartDate, 6);
    const { data, error } = await supabase
      .from('planned_shifts' as any)
      .select('*')
      .eq('farm_id', farmId)
      .gte('shift_date', weekStartDate)
      .lte('shift_date', end)
      .order('shift_date', { ascending: true })
      .order('start_time', { ascending: true, nullsFirst: true });
    if (error) throw error;
    return (data || []) as unknown as PlannedShift[];
  },

  async upsertShift(input: UpsertPlannedShiftInput): Promise<PlannedShift> {
    if (input.id) {
      const { id, farm_id, ...rest } = input;
      const { data, error } = await supabase
        .from('planned_shifts' as any)
        .update(rest)
        .eq('id', id)
        .eq('farm_id', farm_id)
        .select('*')
        .single();
      if (error) throw error;
      return data as unknown as PlannedShift;
    }
    const { data, error } = await supabase
      .from('planned_shifts' as any)
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as unknown as PlannedShift;
  },

  async deleteShift(id: string, farmId: string): Promise<void> {
    const { error } = await supabase
      .from('planned_shifts' as any)
      .delete()
      .eq('id', id)
      .eq('farm_id', farmId);
    if (error) throw error;
  },

  /**
   * Fetch real punch-in/out work_shifts for a set of users on a given local date.
   * Used to compute the "prévu vs réel" gap on ShiftCard.
   */
  async listActualsForUsersOnDate(
    farmId: string,
    date: string,
    userIds: string[],
  ): Promise<WorkShift[]> {
    if (!userIds.length) return [];
    const start = new Date(date + 'T00:00:00');
    const end = new Date(date + 'T00:00:00');
    end.setDate(end.getDate() + 1);
    const { data, error } = await supabase
      .from('work_shifts')
      .select('*')
      .eq('farm_id', farmId)
      .in('user_id', userIds)
      .gte('punch_in_at', start.toISOString())
      .lt('punch_in_at', end.toISOString())
      .order('punch_in_at', { ascending: true });
    if (error) throw error;
    return (data || []) as WorkShift[];
  },
};