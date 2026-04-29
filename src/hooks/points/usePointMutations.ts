import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PointEventType, PointPriority, PointStatus, PointType } from '@/types/Point';

export interface NewPointInput {
  farm_id: string;
  type: PointType;
  entity_label: string | null;
  title: string;
  priority: PointPriority;
  initialNote?: string;
  initialPhotoUrls?: string[];
}

export function useCreatePoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewPointInput) => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) throw new Error('Non authentifié');

      const { data: point, error } = await supabase
        .from('points')
        .insert({
          farm_id: input.farm_id,
          type: input.type,
          entity_label: input.entity_label,
          title: input.title,
          priority: input.priority,
          status: 'open',
          created_by: uid,
        })
        .select()
        .single();
      if (error) throw error;

      if (input.initialNote || (input.initialPhotoUrls && input.initialPhotoUrls.length)) {
        const { error: eventErr } = await supabase.from('point_events').insert({
          point_id: point.id,
          event_type: 'note',
          note: input.initialNote ?? null,
          photo_urls: input.initialPhotoUrls ?? [],
          created_by: uid,
        });
        if (eventErr) throw eventErr;
      }
      return point;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['points'] });
      toast.success('Point créé');
    },
    onError: (e: any) => toast.error(e.message ?? 'Erreur lors de la création'),
  });
}

export function useUpdatePointStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PointStatus }) => {
      const patch: any = { status };
      patch.resolved_at = status === 'resolved' ? new Date().toISOString() : null;
      const { error } = await supabase.from('points').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['points'] });
      qc.invalidateQueries({ queryKey: ['point', vars.id] });
    },
    onError: (e: any) => toast.error(e.message ?? 'Erreur'),
  });
}

export interface NewEventInput {
  point_id: string;
  event_type: PointEventType;
  note: string | null;
  photo_urls?: string[];
}

export function useAddPointEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewEventInput) => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) throw new Error('Non authentifié');
      const { error } = await supabase.from('point_events').insert({
        point_id: input.point_id,
        event_type: input.event_type,
        note: input.note,
        photo_urls: input.photo_urls ?? [],
        created_by: uid,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['point-events', vars.point_id] });
      qc.invalidateQueries({ queryKey: ['points'] });
      toast.success('Événement ajouté');
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur lors de l'ajout"),
  });
}

export function useDeletePoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('points').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['points'] });
      toast.success('Point supprimé');
    },
    onError: (e: any) => toast.error(e.message ?? 'Erreur'),
  });
}

export function useUpdatePointEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      point_id,
      note,
      event_type,
    }: {
      id: string;
      point_id: string;
      note: string | null;
      event_type: PointEventType;
    }) => {
      const { error } = await supabase
        .from('point_events')
        .update({ note, event_type })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['point-events', vars.point_id] });
      toast.success('Événement modifié');
    },
    onError: (e: any) => toast.error(e.message ?? 'Erreur'),
  });
}

export function useDeletePointEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, point_id: _p }: { id: string; point_id: string }) => {
      const { error } = await supabase.from('point_events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['point-events', vars.point_id] });
      qc.invalidateQueries({ queryKey: ['points'] });
      toast.success('Événement supprimé');
    },
    onError: (e: any) => toast.error(e.message ?? 'Erreur'),
  });
}