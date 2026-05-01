import { supabase } from '@/integrations/supabase/client';
import {
  isUniqueViolation,
  type EnsureShiftResult,
  type ShiftListItem,
  type ShiftReport,
  type ShiftTaskBreakdown,
  type WorkShift,
} from './types';

interface SessionRowForReport {
  task_id: string | null;
  title: string | null;
  start_time: string;
  end_time: string | null;
}

function diffSeconds(start: string, end: string | null): number {
  const startMs = new Date(start).getTime();
  const endMs = end ? new Date(end).getTime() : Date.now();
  return Math.max(0, Math.floor((endMs - startMs) / 1000));
}

async function sumTaskSecondsForShift(shiftId: string): Promise<{ total: number; breakdown: ShiftTaskBreakdown[] }> {
  const { data, error } = await supabase
    .from('time_sessions')
    .select('task_id,title,start_time,end_time')
    .eq('work_shift_id', shiftId);
  if (error) throw error;
  const rows = (data as SessionRowForReport[] | null) ?? [];

  const byKey = new Map<string, ShiftTaskBreakdown>();
  let total = 0;
  for (const r of rows) {
    const seconds = diffSeconds(r.start_time, r.end_time);
    total += seconds;
    const key = r.task_id ?? `__notask__${r.title ?? ''}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.seconds += seconds;
    } else {
      byKey.set(key, {
        task_id: r.task_id,
        title: r.title ?? 'Sans titre',
        seconds,
      });
    }
  }

  return { total, breakdown: Array.from(byKey.values()).sort((a, b) => b.seconds - a.seconds) };
}

export const workShiftService = {
  async getActiveShift(userId: string): Promise<WorkShift | null> {
    const { data, error } = await supabase
      .from('work_shifts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('punch_in_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data as WorkShift | null) ?? null;
  },

  async punchIn(userId: string, farmId: string): Promise<WorkShift> {
    const { data, error } = await supabase
      .from('work_shifts')
      .insert({ user_id: userId, farm_id: farmId, status: 'active' })
      .select('*')
      .single();
    if (error) throw error;
    return data as WorkShift;
  },

  /**
   * Race-safe ensure-active-shift.
   *
   * Returns autoCreated:false in two cases:
   *  1. A shift was already active before this call.
   *  2. A concurrent request created the shift first (PG 23505 on the
   *     uniq_active_work_shift_user partial index) — we re-read and
   *     consider the shift NOT created by this action, so the
   *     "Journée commencée automatiquement." toast does not fire.
   *
   * Returns autoCreated:true only when this exact call inserted the shift.
   */
  async ensureActiveShift(userId: string, farmId: string): Promise<EnsureShiftResult> {
    const existing = await this.getActiveShift(userId);
    if (existing) return { shift: existing, autoCreated: false };

    try {
      const inserted = await this.punchIn(userId, farmId);
      return { shift: inserted, autoCreated: true };
    } catch (err) {
      if (isUniqueViolation(err)) {
        const reread = await this.getActiveShift(userId);
        if (reread) return { shift: reread, autoCreated: false };
      }
      throw err;
    }
  },

  async punchOut(shiftId: string): Promise<void> {
    const { error } = await supabase
      .from('work_shifts')
      .update({ status: 'completed', punch_out_at: new Date().toISOString() })
      .eq('id', shiftId);
    if (error) throw error;
  },

  async listShifts(farmId: string, userId: string, limit: number = 60): Promise<ShiftListItem[]> {
    const { data, error } = await supabase
      .from('work_shifts')
      .select('*')
      .eq('farm_id', farmId)
      .eq('user_id', userId)
      .order('punch_in_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    const shifts = (data as WorkShift[] | null) ?? [];

    const items: ShiftListItem[] = [];
    for (const shift of shifts) {
      const punchedSeconds = diffSeconds(shift.punch_in_at, shift.punch_out_at);
      const { total: taskSeconds } = await sumTaskSecondsForShift(shift.id);
      const offTaskSeconds = Math.max(0, punchedSeconds - taskSeconds);
      items.push({ shift, punchedSeconds, taskSeconds, offTaskSeconds });
    }
    return items;
  },

  async getShiftReport(shiftId: string): Promise<ShiftReport> {
    const { data, error } = await supabase
      .from('work_shifts')
      .select('*')
      .eq('id', shiftId)
      .single();
    if (error) throw error;
    const shift = data as WorkShift;

    const punchedSeconds = diffSeconds(shift.punch_in_at, shift.punch_out_at);
    const { total: taskSeconds, breakdown } = await sumTaskSecondsForShift(shiftId);
    // Clamp: rounding, overlapping sessions or legacy data must never produce a negative value.
    const offTaskSeconds = Math.max(0, punchedSeconds - taskSeconds);

    return {
      shift,
      punchedSeconds,
      taskSeconds,
      offTaskSeconds,
      tasks: breakdown,
    };
  },
};
