import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LinkedTask {
  id: string;
  title: string;
  status: string;
  due_date: string;
  assigned_to: string | null;
  computed_priority: string;
  manual_priority: string | null;
}

export function usePointLinkedTasks(pointId: string | null) {
  return useQuery({
    queryKey: ['point-linked-tasks', pointId],
    enabled: !!pointId,
    queryFn: async (): Promise<LinkedTask[]> => {
      const { data, error } = await supabase
        .from('planning_tasks')
        .select('id, title, status, due_date, assigned_to, computed_priority, manual_priority')
        .eq('source_module', 'points')
        .eq('source_id', pointId!)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as LinkedTask[];
    },
  });
}

export interface NewLinkedTaskInput {
  farm_id: string;
  point_id: string;
  title: string;
  due_date: string; // ISO date
  assigned_to: string | null;
  priority: 'critical' | 'important' | 'todo';
  notes?: string;
}

export function useCreateLinkedTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewLinkedTaskInput) => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) throw new Error('Non authentifié');
      const { error } = await supabase.from('planning_tasks').insert({
        farm_id: input.farm_id,
        title: input.title,
        due_date: input.due_date,
        assigned_to: input.assigned_to,
        manual_priority: input.priority,
        computed_priority: input.priority,
        status: 'todo',
        category: 'autre',
        created_by: uid,
        source_module: 'points',
        source_id: input.point_id,
        notes: input.notes ?? null,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['point-linked-tasks', vars.point_id] });
      qc.invalidateQueries({ queryKey: ['planning-tasks'] });
      toast.success('Tâche créée');
    },
    onError: (e: any) => toast.error(e.message ?? 'Erreur'),
  });
}