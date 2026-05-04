import { supabase } from '@/integrations/supabase/client';
import type { PlanningTask } from './planningService';
import { mapCategoryToTaskType, PLANNING_CATEGORY_LABELS } from './planningTaskTypeMap';
import { workShiftService } from '@/services/work-shifts';

export const ERR_USER_SESSION_ACTIVE = 'USER_SESSION_ACTIVE';
export const ERR_TASK_SESSION_ACTIVE = 'TASK_SESSION_ACTIVE';
export const ERR_TASK_OWNED_BY_OTHER = 'TASK_OWNED_BY_OTHER';

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
  activeUserId: string | null;
  lastUserId: string | null;
}

interface RawSessionRow {
  id: string;
  user_id: string;
  task_id: string | null;
  start_time: string;
  end_time: string | null;
  status: TaskSessionStatus;
}

export const planningTimeService = {
  async getTaskSessions(taskId: string): Promise<TaskSessionRow[]> {
    const { data, error } = await supabase
      .from('time_sessions')
      .select('id,user_id,task_id,start_time,end_time,status')
      .eq('task_id', taskId)
      .order('start_time', { ascending: false });
    if (error) throw error;

    const rows = (data as unknown as RawSessionRow[] | null) ?? [];
    if (rows.length === 0) return [];

    // Charger les profils séparément : la FK time_sessions.user_id pointe vers
    // auth.users (pas vers public.profiles), donc PostgREST ne peut pas inférer
    // un join — un select avec embed planterait toute la requête.
    const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds);

    const nameById = new Map<string, string>();
    (profiles ?? []).forEach((p) => {
      const full = [p.first_name, p.last_name].filter(Boolean).join(' ').trim();
      if (full.length > 0) nameById.set(p.id, full);
    });

    return rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      task_id: r.task_id,
      start_time: r.start_time,
      end_time: r.end_time,
      status: r.status,
      user_name: nameById.get(r.user_id) ?? null,
    }));
  },

  async getTaskTimeStats(taskId: string): Promise<TaskTimeStats> {
    const sessions = await this.getTaskSessions(taskId);
    let totalMs = 0;
    let activeId: string | null = null;
    let activeStart: string | null = null;
    let activeUser: string | null = null;
    for (const s of sessions) {
      const start = new Date(s.start_time).getTime();
      const end = s.end_time ? new Date(s.end_time).getTime() : Date.now();
      totalMs += Math.max(0, end - start);
      if (s.status === 'active' && !s.end_time) {
        activeId = s.id;
        activeStart = s.start_time;
        activeUser = s.user_id;
      }
    }
    // sessions sont triées start_time DESC → la première est la plus récente
    const lastUser = sessions.length > 0 ? sessions[0].user_id : null;
    return {
      totalSeconds: Math.floor(totalMs / 1000),
      sessionCount: sessions.length,
      hasActive: activeId !== null,
      activeSessionId: activeId,
      activeStartTime: activeStart,
      activeUserId: activeUser,
      lastUserId: lastUser,
    };
  },

  async startSessionForTask(
    task: PlanningTask,
    userId: string,
  ): Promise<{ autoCreatedShift: boolean }> {
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

    // Si la tâche a déjà été travaillée et qu'elle est en pause / in_progress sans
    // session active, seul le dernier utilisateur (propriétaire en cours) peut la
    // reprendre. On regarde la session la plus récente sur la tâche.
    // Robustesse : si aucune session précédente n'est trouvée (données manquantes,
    // tâche jamais démarrée techniquement, historique purgé) ou si la requête
    // échoue, on NE BLOQUE PAS — on laisse l'utilisateur reprendre la tâche.
    if (task.status === 'paused' || task.status === 'in_progress') {
      try {
        const { data: lastSession, error: lastErr } = await supabase
          .from('time_sessions')
          .select('user_id')
          .eq('task_id', task.id)
          .order('start_time', { ascending: false })
          .limit(1)
          .maybeSingle();
        // Erreur réseau / RLS : on log mais on ne bloque pas un utilisateur
        // légitime à cause d'un échec de lecture transitoire.
        if (lastErr) {
          console.warn('[planningTime] last-session lookup failed, allowing resume', lastErr);
        } else if (lastSession?.user_id && lastSession.user_id !== userId) {
          throw new Error(ERR_TASK_OWNED_BY_OTHER);
        }
        // lastSession null → aucune session précédente : on autorise (auto-héritage).
      } catch (e) {
        // Re-throw uniquement notre erreur métier ; tout le reste est ignoré.
        if (e instanceof Error && e.message === ERR_TASK_OWNED_BY_OTHER) throw e;
        console.warn('[planningTime] last-session check skipped', e);
      }
    }

    // Auto Punch In : assure une journée active, race-safe (23505).
    const { shift, autoCreated } = await workShiftService.ensureActiveShift(
      userId,
      task.farm_id,
    );

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
      work_shift_id: shift.id,
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

    return { autoCreatedShift: autoCreated };
  },

  resumeSessionForTask(task: PlanningTask, userId: string): Promise<{ autoCreatedShift: boolean }> {
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