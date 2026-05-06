import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plannedShiftsService } from '@/services/planned-shifts/plannedShiftsService';
import type { UpsertPlannedShiftInput } from '@/types/PlannedShift';

export function usePlannedShiftsDay(farmId: string | null, date: string) {
  return useQuery({
    queryKey: ['planned-shifts', farmId, 'day', date],
    queryFn: () => plannedShiftsService.listByDay(farmId!, date),
    enabled: !!farmId && !!date,
  });
}

export function usePlannedShiftsWeek(farmId: string | null, weekStart: string) {
  return useQuery({
    queryKey: ['planned-shifts', farmId, 'week', weekStart],
    queryFn: () => plannedShiftsService.listByWeek(farmId!, weekStart),
    enabled: !!farmId && !!weekStart,
  });
}

export function useUpsertPlannedShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertPlannedShiftInput) => plannedShiftsService.upsertShift(input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['planned-shifts', variables.farm_id] });
    },
  });
}

export function useDeletePlannedShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, farmId }: { id: string; farmId: string }) =>
      plannedShiftsService.deleteShift(id, farmId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['planned-shifts', variables.farmId] });
    },
  });
}

export function useActualShiftsForDay(
  farmId: string | null,
  date: string,
  userIds: string[],
) {
  const key = [...userIds].sort().join(',');
  return useQuery({
    queryKey: ['work-shifts-actuals', farmId, date, key],
    queryFn: () => plannedShiftsService.listActualsForUsersOnDate(farmId!, date, userIds),
    enabled: !!farmId && !!date && userIds.length > 0,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}