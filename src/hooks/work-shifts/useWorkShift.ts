import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workShiftService } from '@/services/work-shifts';
import type { ShiftListItem, WorkShift } from '@/services/work-shifts';

export function useActiveWorkShift(userId: string | null | undefined) {
  return useQuery<WorkShift | null>({
    queryKey: ['active-work-shift', userId],
    queryFn: () => workShiftService.getActiveShift(userId as string),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useShiftList(farmId: string | null, userId: string | null) {
  return useQuery<ShiftListItem[]>({
    queryKey: ['work-shifts-list', farmId, userId],
    queryFn: () => workShiftService.listShifts(farmId as string, userId as string),
    enabled: !!farmId && !!userId,
    staleTime: 30_000,
  });
}

export function useWorkShiftMutations() {
  const qc = useQueryClient();

  const invalidateAll = (): void => {
    qc.invalidateQueries({ queryKey: ['active-work-shift'] });
    qc.invalidateQueries({ queryKey: ['work-shifts-list'] });
    qc.invalidateQueries({ queryKey: ['planningTasks'] });
    qc.invalidateQueries({ queryKey: ['active-time-entry'] });
    qc.invalidateQueries({ queryKey: ['dashboard-v2', 'activeTeam'] });
    qc.invalidateQueries({ queryKey: ['farm-team-status'] });
  };

  const punchIn = useMutation({
    mutationFn: ({ userId, farmId }: { userId: string; farmId: string }) =>
      workShiftService.punchIn(userId, farmId),
    onSuccess: () => {
      invalidateAll();
      toast.success('Journée commencée');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Impossible de commencer la journée.';
      toast.error(msg);
    },
  });

  const punchOut = useMutation({
    mutationFn: ({ shiftId }: { shiftId: string }) => workShiftService.punchOut(shiftId),
    onSuccess: () => {
      invalidateAll();
      toast.success('Journée terminée');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Impossible de terminer la journée.';
      toast.error(msg);
    },
  });

  return { punchIn, punchOut };
}
