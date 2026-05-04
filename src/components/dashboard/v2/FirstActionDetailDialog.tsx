import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClipboardList, Wrench, Eye } from 'lucide-react';
import { TaskDetailDialog } from '@/components/planning/TaskDetailDialog';
import MaintenanceTaskDetailDialog from '@/components/maintenance/dialogs/MaintenanceTaskDetailDialog';
import { PointDetailDialog } from '@/components/points/PointDetailDialog';
import { usePlanningTasks } from '@/hooks/planning/usePlanningTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useFarmId } from '@/hooks/useFarmId';
import type { FirstAction } from '@/hooks/dashboard/v2/useFirstAction';
import type { PlanningTask } from '@/services/planning/planningService';
import type { Point } from '@/types/Point';

interface Props {
  action: FirstAction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_BADGES = {
  planning: { label: 'Tâche', Icon: ClipboardList, classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
  maintenance: { label: 'Maintenance', Icon: Wrench, classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  point: { label: 'Point à surveiller', Icon: Eye, classes: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' },
} as const;

function TypeBadge({ source }: { source: 'planning' | 'maintenance' | 'point' }) {
  const cfg = TYPE_BADGES[source];
  const Icon = cfg.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cfg.classes}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

/** Maps a maintenance_tasks DB row to the shape MaintenanceTaskDetailDialog expects. */
function mapMaintenanceRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    equipment: row.equipment,
    equipmentId: row.equipment_id,
    type: row.type,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date ? new Date(row.due_date) : new Date(),
    completedDate: row.completed_date ? new Date(row.completed_date) : undefined,
    engineHours: row.estimated_duration || 0,
    actualDuration: row.actual_duration,
    assignedTo: row.assigned_to || '',
    notes: row.notes || '',
    trigger_unit: row.trigger_unit,
    trigger_hours: row.trigger_hours,
    trigger_kilometers: row.trigger_kilometers,
    completed_at_hours: row.completed_at_hours,
    completed_at_km: row.completed_at_km,
    is_recurrent: row.is_recurrent || false,
    recurrence_interval: row.recurrence_interval,
    recurrence_unit: row.recurrence_unit,
  };
}

export const FirstActionDetailDialog: React.FC<Props> = ({ action, open, onOpenChange }) => {
  const { farmId } = useFarmId();
  const { teamMembers } = useTeamMembers();
  const planning = usePlanningTasks(farmId, undefined, undefined);

  const source = action?.source ?? null;
  const sourceId = action?.sourceId ?? null;

  // Fetch planning task by id
  const { data: planningTask } = useQuery({
    queryKey: ['firstAction', 'planning', sourceId],
    enabled: open && source === 'planning' && !!sourceId,
    queryFn: async () => {
      const { data } = await supabase
        .from('planning_tasks')
        .select('*')
        .eq('id', String(sourceId))
        .maybeSingle();
      return data as unknown as PlanningTask | null;
    },
  });

  // Fetch maintenance task by id
  const { data: maintenanceTask } = useQuery({
    queryKey: ['firstAction', 'maintenance', sourceId],
    enabled: open && source === 'maintenance' && !!sourceId,
    queryFn: async () => {
      const { data } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('id', Number(sourceId))
        .maybeSingle();
      return mapMaintenanceRow(data);
    },
  });

  // Fetch point by id
  const { data: point } = useQuery({
    queryKey: ['firstAction', 'point', sourceId],
    enabled: open && source === 'point' && !!sourceId,
    queryFn: async () => {
      const { data } = await supabase
        .from('points')
        .select('*')
        .eq('id', String(sourceId))
        .maybeSingle();
      return data as unknown as Point | null;
    },
  });

  if (!action) return null;

  if (source === 'planning') {
    const tmList = (teamMembers ?? []).map((m: any) => ({
      id: m.id,
      name: `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim() || m.email || 'Membre',
    }));
    return (
      <TaskDetailDialog
        task={planningTask ?? null}
        open={open && !!planningTask}
        onOpenChange={onOpenChange}
        teamMembers={tmList}
        onStatusChange={(id, status) => planning.updateStatus.mutate({ id, status })}
        onPostpone={(id, newDate) => planning.postponeTask.mutate({ id, newDate })}
        onDelete={(id) => planning.deleteTask.mutate(id)}
        onUpdate={(id, updates) => planning.updateTask.mutate({ id, updates })}
        headerBadge={<TypeBadge source="planning" />}
      />
    );
  }

  if (source === 'maintenance') {
    return (
      <MaintenanceTaskDetailDialog
        isOpen={open && !!maintenanceTask}
        onClose={() => onOpenChange(false)}
        task={maintenanceTask}
        headerBadge={<TypeBadge source="maintenance" />}
      />
    );
  }

  if (source === 'point') {
    return (
      <PointDetailDialog
        point={point ?? null}
        open={open && !!point}
        onOpenChange={onOpenChange}
        headerBadge={<TypeBadge source="point" />}
      />
    );
  }

  return null;
};