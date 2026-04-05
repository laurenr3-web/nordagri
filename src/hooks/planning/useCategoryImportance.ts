
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planningService, PlanningCategory, PlanningPriority, CategoryImportance } from '@/services/planning/planningService';
import { useEffect } from 'react';

export function useCategoryImportance(farmId: string | null) {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categoryImportance', farmId],
    queryFn: async () => {
      await planningService.ensureDefaults(farmId!);
      return planningService.getCategoryImportance(farmId!);
    },
    enabled: !!farmId,
  });

  const importanceMap: Record<string, PlanningPriority> = {};
  categories.forEach(c => {
    importanceMap[c.category] = c.importance;
  });

  const updateImportance = useMutation({
    mutationFn: ({ id, importance }: { id: string; importance: PlanningPriority }) =>
      planningService.updateCategoryImportance(id, importance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryImportance'] });
      queryClient.invalidateQueries({ queryKey: ['planningTasks'] });
    },
  });

  return {
    categories,
    importanceMap,
    isLoading,
    updateImportance,
  };
}
