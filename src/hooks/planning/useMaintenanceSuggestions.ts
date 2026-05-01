import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { planningService } from '@/services/planning/planningService';
import { toast } from 'sonner';
import { todayLocal } from '@/lib/dateLocal';


export interface MaintenanceSuggestion {
  id: number;
  title: string;
  equipmentName: string;
  equipmentId: number | null;
  isOverdue: boolean;
  daysLate: number;
  isCounterBased: boolean;
  counterLabel: string;
  alreadyPlanned: boolean;
}

export function useMaintenanceSuggestions(farmId: string | null, userId: string | null) {
  const queryClient = useQueryClient();
  const todayStr = todayLocal();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['maintenanceSuggestions', farmId],
    enabled: !!farmId,
    queryFn: async () => {
      // 1. Fetch maintenance tasks with equipment info
      const { data: tasks, error } = await supabase
        .from('maintenance_tasks')
        .select('id, title, due_date, status, trigger_unit, trigger_hours, trigger_kilometers, equipment_id, equipment:equipment_id(valeur_actuelle, farm_id, name)')
        .not('status', 'in', '("completed","cancelled")');

      if (error) throw error;

      // Filter by farm
      const farmTasks = (tasks || []).filter((t: any) => {
        const eq = Array.isArray(t.equipment) ? t.equipment[0] : t.equipment;
        return eq?.farm_id === farmId;
      });

      // Determine which are due
      const dueTasks: Array<any & { _eq: any }> = [];
      for (const t of farmTasks) {
        const eq = Array.isArray(t.equipment) ? t.equipment[0] : t.equipment;
        if (!eq) continue;

        const triggerUnit = t.trigger_unit || 'none';
        const currentVal = eq.valeur_actuelle || 0;

        let isDue = false;
        let isCounterBased = false;
        let counterLabel = '';

        if (triggerUnit === 'hours' && t.trigger_hours) {
          isCounterBased = true;
          if (currentVal >= t.trigger_hours) {
            isDue = true;
            counterLabel = `Seuil d'entretien dépassé (${currentVal}/${t.trigger_hours} h)`;
          }
        } else if (triggerUnit === 'kilometers' && t.trigger_kilometers) {
          isCounterBased = true;
          if (currentVal >= t.trigger_kilometers) {
            isDue = true;
            counterLabel = `Seuil d'entretien dépassé (${currentVal}/${t.trigger_kilometers} km)`;
          }
        } else {
          // Date-based
          const dueDate = t.due_date ? t.due_date.split('T')[0] : null;
          if (dueDate && dueDate <= todayStr) {
            isDue = true;
          }
        }

        if (isDue) {
          dueTasks.push({ ...t, _eq: eq, _isCounterBased: isCounterBased, _counterLabel: counterLabel });
        }
      }

      if (dueTasks.length === 0) return [];

      // 2. Anti-doublon: check existing planning tasks
      const { data: existingTasks } = await supabase
        .from('planning_tasks')
        .select('source_id, status')
        .eq('farm_id', farmId!)
        .eq('source_module', 'maintenance')
        .in('status', ['todo', 'in_progress', 'blocked']);

      const plannedIds = new Set((existingTasks || []).map((t: any) => t.source_id));

      // 3. Build suggestions
      return dueTasks.map((t): MaintenanceSuggestion => {
        const dueDate = t.due_date ? new Date(t.due_date) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysLate = dueDate ? Math.max(0, Math.floor((today.getTime() - new Date(dueDate).setHours(0, 0, 0, 0)) / 86400000)) : 0;
        const isOverdue = t._isCounterBased ? true : daysLate > 0;

        return {
          id: t.id,
          title: t.title,
          equipmentName: t._eq.name || 'Équipement',
          equipmentId: t.equipment_id,
          isOverdue,
          daysLate,
          isCounterBased: t._isCounterBased,
          counterLabel: t._counterLabel,
          alreadyPlanned: plannedIds.has(String(t.id)),
        };
      });
    },
  });

  const createTask = useMutation({
    mutationFn: async ({ suggestion, date }: { suggestion: MaintenanceSuggestion; date?: string }) => {
      if (!farmId || !userId) throw new Error('Missing farm or user');

      const targetDate = date || todayStr;
      const priority = suggestion.isOverdue ? 'critical' : 'important';
      const notesLines = [`Maintenance : ${suggestion.title}`, `Équipement : ${suggestion.equipmentName}`];
      if (suggestion.isCounterBased) {
        notesLines.push(suggestion.counterLabel);
      } else if (suggestion.daysLate > 0) {
        notesLines.push(`En retard de ${suggestion.daysLate} jour${suggestion.daysLate > 1 ? 's' : ''}`);
      }

      await planningService.addTask({
        farm_id: farmId,
        title: `Maintenance : ${suggestion.title}`,
        category: 'equipement',
        due_date: targetDate,
        computed_priority: priority,
        manual_priority: priority,
        created_by: userId,
        equipment_id: suggestion.equipmentId,
        notes: notesLines.join('\n'),
        source_module: 'maintenance',
        source_id: String(suggestion.id),
      });
    },
    onSuccess: () => {
      toast.success('Tâche créée depuis la maintenance');
      queryClient.invalidateQueries({ queryKey: ['planningTasks'] });
      queryClient.invalidateQueries({ queryKey: ['planningOverdue'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceSuggestions'] });
    },
    onError: () => {
      toast.error('Erreur lors de la création de la tâche');
    },
  });

  // Filter: only show actionable (not already planned)
  const actionableSuggestions = suggestions.filter(s => !s.alreadyPlanned);

  return {
    suggestions: actionableSuggestions,
    isLoading,
    createTask,
  };
}
