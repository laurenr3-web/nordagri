import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFarmId } from '@/hooks/useFarmId';
import { usePoints } from '@/hooks/points/usePoints';
import { usePlanningTasks } from '@/hooks/planning/usePlanningTasks';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { todayLocal } from '@/lib/dateLocal';
import { Wrench, AlertCircle, Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ToNotForgetTab() {
  const today = todayLocal();
  const { farmId } = useFarmId();
  const { data: points = [] } = usePoints(farmId);
  const { tasks, overdueTasks } = usePlanningTasks(farmId, today, today);

  // Maintenance tasks due (next 7d) or overdue, not done
  const { data: dueMaintenance = [] } = useQuery({
    queryKey: ['team-due-maintenance', farmId, today],
    enabled: !!farmId,
    queryFn: async () => {
      const in7 = new Date();
      in7.setDate(in7.getDate() + 7);
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('id, title, due_date, status, equipment_id, equipment, priority')
        .neq('status', 'completed')
        .lte('due_date', in7.toISOString())
        .order('due_date', { ascending: true })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const openPoints = useMemo(
    () => (points || []).filter((p) => p.status !== 'resolved').slice(0, 10),
    [points]
  );

  const importantUnassigned = useMemo(
    () => (tasks || []).filter((t: any) => {
      const p = t.manual_priority || t.computed_priority;
      return !t.assigned_to && (p === 'critical' || p === 'important') && t.status !== 'done';
    }).slice(0, 10),
    [tasks]
  );

  const blocked = useMemo(
    () => (tasks || []).filter((t: any) => t.status === 'blocked').slice(0, 10),
    [tasks]
  );

  const overdue = useMemo(
    () => (overdueTasks || []).slice(0, 10),
    [overdueTasks]
  );

  return (
    <div className="grid gap-4">
      <Section title="Maintenances dues" icon={<Wrench className="h-4 w-4" />} count={dueMaintenance.length}>
        {dueMaintenance.length === 0 ? <Empty /> : dueMaintenance.map((m: any) => (
          <Card key={m.id} className="p-2.5 text-sm break-words">
            <div className="font-medium">{m.title}</div>
            <div className="text-[11px] text-muted-foreground">{m.equipment || ''}</div>
          </Card>
        ))}
      </Section>

      <Section title="Points à surveiller" icon={<Eye className="h-4 w-4" />} count={openPoints.length}>
        {openPoints.length === 0 ? <Empty /> : openPoints.map((p: any) => (
          <Card key={p.id} className="p-2.5 text-sm break-words">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium truncate">{p.title}</span>
              <Badge variant="outline" className="text-[10px] shrink-0">{p.priority}</Badge>
            </div>
          </Card>
        ))}
      </Section>

      <Section title="Tâches importantes non assignées" icon={<AlertCircle className="h-4 w-4" />} count={importantUnassigned.length}>
        {importantUnassigned.length === 0 ? <Empty /> : importantUnassigned.map((t: any) => (
          <Card key={t.id} className="p-2.5 text-sm break-words">{t.title}</Card>
        ))}
      </Section>

      <Section title="Tâches bloquées" icon={<AlertCircle className="h-4 w-4" />} count={blocked.length}>
        {blocked.length === 0 ? <Empty /> : blocked.map((t: any) => (
          <Card key={t.id} className="p-2.5 text-sm break-words">{t.title}</Card>
        ))}
      </Section>

      <Section title="Tâches en retard" icon={<Clock className="h-4 w-4" />} count={overdue.length}>
        {overdue.length === 0 ? <Empty /> : overdue.map((t: any) => (
          <Card key={`${t.id}_${t.due_date}`} className="p-2.5 text-sm break-words">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium truncate">{t.title}</span>
              <Badge variant="destructive" className="text-[10px] shrink-0">{t.due_date}</Badge>
            </div>
          </Card>
        ))}
      </Section>

      <Link to="/planning" className="text-xs text-primary text-center underline-offset-2 hover:underline">
        Ouvrir la planification complète
      </Link>
    </div>
  );
}

function Section({ title, icon, count, children }: { title: string; icon: React.ReactNode; count: number; children: React.ReactNode }) {
  return (
    <section className="grid gap-1.5">
      <h2 className="text-sm font-semibold flex items-center gap-1.5">
        {icon}
        {title}
        <Badge variant="secondary" className="text-[10px] ml-auto">{count}</Badge>
      </h2>
      <div className="grid gap-1.5">{children}</div>
    </section>
  );
}

function Empty() {
  return <div className="text-xs text-muted-foreground py-1">—</div>;
}