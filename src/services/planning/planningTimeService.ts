import { supabase } from '@/integrations/supabase/client';
import type { PlanningTask } from './planningService';
import { mapCategoryToTaskType, PLANNING_CATEGORY_LABELS } from './planningTaskTypeMap';

export const ERR_USER_SESSION_ACTIVE = 'USER_SESSION_ACTIVE';
export const ERR_TASK_SESSION_ACTIVE = 'TASK_SESSION_ACTIVE';

interface PgError { code?: string; message?: string }

function isUniqueViolation(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  return (err as PgError).code === '23505';
}

export type TaskSessionStatus = 'active' | 'paused' | 'completed' | 'disputed';

export interface TaskSessionRow {
  id: string;
  user_id: string;
  task_id: string | null;
  start_time: string;
  end_time: string | null;
  status: TaskSessionStatus;
  user_name: string | null;
}

export interface TaskTimeStats {
  totalSeconds: number;
  sessionCount: number;
  hasActive: boolean;
  activeSessionId: string | null;
  activeStartTime: string | null;
}

interface RawSessionRow {
  id: string;
  user_id: string;
  task_id: string | null;
  start_time: string;
  end_time: string | null;
  status: TaskSessionStatus;
  profiles: { first_name: string | null; last_name: string | null } | null;
}

export const planningTimeService = {
  async getTaskSessions(taskId: string): Promise<TaskSessionRow[]> {
    const { data, error } = await supabase
      .from('time_sessions')
      .select('id,user_id,task_id,start_time,end_time,status,profiles:user_id(first_name,last_name)')
      .eq('task_id', taskId)
      .order('start_time', { ascending: false });
    if (error) throw error;

    const rows = (data as unknown as RawSessionRow[] | null) ?? [];
    return rows.map((r) => {
      const fullName = r.profiles
        ? [r.profiles.first_name, r.profiles.last_name].filter(Boolean).join(' ')
        : '';
      return {
        id: r.id,
        user_id: r.user_id,
        task_id: r.task_id,
        start_time: r.start_time,
        end_time: r.end_time,
        status: r.status,
        user_name: fullName.length > 0 ? fullName : null,
      };
    });
  },

  async getTaskTimeStats(taskId: string): Promise<TaskTimeStats> {
    const sessions = await this.getTaskSessions(taskId);
    let totalMs = 0;
    let activeId: string | null = null;
    let activeStart: string | null = null;
    for (const s of sessions) {
      const start = new Date(s.start_time).getTime();
      const end = s.end_time ? new Date(s.end_time).getTime() : Date.now();
      totalMs += Math.max(0, end - start);
      if (s.status === 'active' && !s.end_time) {
        activeId = s.id;
        activeStart = s.start_time;
      }
    }
    return {
      totalSeconds: Math.floor(totalMs / 1000),
      sessionCount: sessions.length,
      hasActive: activeId !== null,
      activeSessionId: activeId,
      activeStartTime: activeStart,
    };
  },

  async startSessionForTask(task: PlanningTask, userId: string): Promise<void> {
    // UX pré-check : session active utilisateur
    const { data: own, error: ownErr } = await supabase
      .from('time_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();
    if (ownErr) throw ownErr;
    if (own) throw new Error(ERR_USER_SESSION_ACTIVE);

    // UX pré-check : session active sur la tâche (cross-user, RPC SECURITY DEFINER)
    const { data: hasActive, error: rpcErr } = await supabase.rpc(
      'has_active_session_on_task',
      { _task_id: task.id },
    );
    if (rpcErr) throw rpcErr;
    if (hasActive === true) throw new Error(ERR_TASK_SESSION_ACTIVE);

    // Résolution task_type_id (best-effort, nullable accepté en DB)
    const taskTypeName = mapCategoryToTaskType(task.category);
    const { data: tt } = await supabase
      .from('task_types')
      .select('id')
      .eq('name', taskTypeName)
      .maybeSingle();

    // INSERT — vraie garantie via index unique partiel
    const { error: insErr } = await supabase.from('time_sessions').insert({
      user_id: userId,
      task_id: task.id,
      equipment_id: task.equipment_id ?? null,
      task_type_id: tt?.id ?? null,
      custom_task_type: PLANNING_CATEGORY_LABELS[task.category],
      title: task.title,
      status: 'active',
      start_time: new Date().toISOString(),
      technician: 'Self',
    });
    if (insErr) {
      if (isUniqueViolation(insErr)) throw new Error(ERR_TASK_SESSION_ACTIVE);
      throw insErr;
    }

    // Invariant : session active ⇒ tâche in_progress
    const { error: updErr } = await supabase
      .from('planning_tasks')
      .update({ status: 'in_progress' })
      .eq('id', task.id);
    if (updErr) throw updErr;
  },

  resumeSessionForTask(task: PlanningTask, userId: string): Promise<void> {
    return this.startSessionForTask(task, userId);
  },

  async pauseSessionForTask(taskId: string): Promise<void> {
    // Cibler exactement UNE session active (la plus récente)
    const { data: s, error: selErr } = await supabase
      .from('time_sessions')
      .select('id')
      .eq('task_id', taskId)
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (selErr) throw selErr;

    if (s) {
      // UPDATE par PK = 1 ligne max affectée
      const { error: updErr } = await supabase
        .from('time_sessions')
        .update({ status: 'completed', end_time: new Date().toISOString() })
        .eq('id', s.id);
      if (updErr) throw updErr;
    }

    const { error: tErr } = await supabase
      .from('planning_tasks')
      .update({ status: 'paused' })
      .eq('id', taskId);
    if (tErr) throw tErr;
  },

  async completeTaskWithSession(taskId: string): Promise<void> {
    const { data: s, error: selErr } = await supabase
      .from('time_sessions')
      .select('id')
      .eq('task_id', taskId)
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (selErr) throw selErr;

    if (s) {
      const { error: updErr } = await supabase
        .from('time_sessions')
        .update({ status: 'completed', end_time: new Date().toISOString() })
        .eq('id', s.id);
      if (updErr) throw updErr;
    }

    const { error } = await supabase
      .from('planning_tasks')
      .update({ status: 'done' })
      .eq('id', taskId);
    if (error) throw error;
  },

  async unblockTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('planning_tasks')
      .update({ status: 'todo' })
      .eq('id', taskId);
    if (error) throw error;
  },
};