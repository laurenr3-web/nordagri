import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Wrench, Eye, Gauge, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { supabase } from '@/integrations/supabase/client';
import { useFarmId } from '@/hooks/useFarmId';
import { computeGlobalStatus, formatCounter, getComputedWearValue, STATUS_MAP } from './statusHelpers';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StatusCardProps {
  equipment: EquipmentItem;
}

const StatusCard: React.FC<StatusCardProps> = ({ equipment }) => {
  const { farmId } = useFarmId();
  const [tasks, setTasks] = useState<any[]>([]);
  const [points, setPoints] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const t = await maintenanceService.getTasksForEquipment(Number(equipment.id));
        if (!cancelled) setTasks(Array.isArray(t) ? t : []);
      } catch { /* noop */ }
    })();
    return () => { cancelled = true; };
  }, [equipment.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!farmId) return;
      try {
        const label = equipment.name || '';
        const { data } = await supabase
          .from('points')
          .select('*')
          .eq('farm_id', farmId)
          .eq('type', 'equipement')
          .neq('status', 'resolved')
          .ilike('entity_label', `%${label}%`)
          .order('last_event_at', { ascending: false });
        if (!cancelled) setPoints((data ?? []) as any[]);
      } catch { /* noop */ }
    })();
  }, [farmId, equipment.name]);

  const currentValue = getComputedWearValue(equipment) ?? 0;
  const overdueTasks = tasks.filter((t: any) => {
    if (t.status === 'completed' || t.status === 'cancelled') return false;
    const th = t.triggerHours ?? t.trigger_hours;
    const tk = t.triggerKilometers ?? t.trigger_kilometers;
    if (t.trigger_unit === 'hours' && th != null) return currentValue >= th;
    if (t.trigger_unit === 'kilometers' && tk != null) return currentValue >= tk;
    return t.dueDate ? new Date(t.dueDate) < new Date() : false;
  });
  const upcoming = tasks
    .filter((t: any) => t.status !== 'completed' && t.status !== 'cancelled')
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const criticalPoint = points.find((p) => p.priority === 'critical');
  const lastPoint = points[0];

  const status = computeGlobalStatus({
    equipment,
    hasOverdueMaintenance: overdueTasks.length > 0,
    hasCriticalPoint: !!criticalPoint,
  });

  let summary = 'Machine prête à être utilisée.';
  if (status.key === 'out_of_service') summary = 'Équipement hors service.';
  else if (status.key === 'maintenance' && overdueTasks.length > 0)
    summary = `${overdueTasks.length} maintenance${overdueTasks.length > 1 ? 's' : ''} en retard.`;
  else if (status.key === 'maintenance') summary = 'Maintenance en cours.';
  else if (status.key === 'watch') summary = `${points.length || 1} point${(points.length || 1) > 1 ? 's' : ''} à vérifier.`;

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${status.badgeClass} border-0`}>
              {status.key === 'active' && <CheckCircle2 className="h-5 w-5" />}
              {status.key === 'watch' && <Eye className="h-5 w-5" />}
              {status.key === 'maintenance' && <Wrench className="h-5 w-5" />}
              {status.key === 'out_of_service' && <AlertTriangle className="h-5 w-5" />}
            </div>
            <div>
              <p className="eq-label">État actuel</p>
              <h2 className="eq-title-h2 mt-0.5">{status.label}</h2>
            </div>
          </div>
          <Badge variant="outline" className={`${status.badgeClass} hidden sm:inline-flex`}>{status.label}</Badge>
        </div>

        <p className="text-sm text-foreground/80 leading-relaxed">{summary}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <Row icon={<Wrench className="h-3.5 w-3.5" />} label="Prochaine maintenance"
               value={upcoming ? `${upcoming.title}` : 'Aucune planifiée'}
               sub={upcoming?.dueDate ? format(new Date(upcoming.dueDate), 'd MMM', { locale: fr }) : undefined} />
          <Row icon={<Eye className="h-3.5 w-3.5" />} label="Dernier point"
               value={lastPoint ? lastPoint.title : 'Aucun point'}
               sub={lastPoint?.priority ? lastPoint.priority : undefined} />
          <Row icon={<Activity className="h-3.5 w-3.5" />} label="Dernière intervention"
               value="Aucune intervention récente" />
          <Row icon={<Gauge className="h-3.5 w-3.5" />} label="Compteur"
               value={formatCounter(equipment)} />
        </div>
      </CardContent>
    </Card>
  );
};

const Row: React.FC<{ icon: React.ReactNode; label: string; value: string; sub?: string }> = ({ icon, label, value, sub }) => (
  <div className="flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2">
    <div className="text-muted-foreground mt-0.5">{icon}</div>
    <div className="min-w-0">
      <p className="eq-label">{label}</p>
      <p className="eq-item-title">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground capitalize">{sub}</p>}
    </div>
  </div>
);

export default StatusCard;