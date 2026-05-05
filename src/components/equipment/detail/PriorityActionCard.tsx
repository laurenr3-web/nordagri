import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, Eye, ChevronRight, CheckCircle2 } from 'lucide-react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { supabase } from '@/integrations/supabase/client';
import { useFarmId } from '@/hooks/useFarmId';
import MaintenanceTaskDetailDialog from '@/components/maintenance/dialogs/MaintenanceTaskDetailDialog';
import { PointDetailDialog } from '@/components/points/PointDetailDialog';

interface Props {
  equipment: EquipmentItem;
  onNavigateToTab?: (tab: string) => void;
}

type Item =
  | { kind: 'maintenance-overdue'; raw: any; title: string; meta: string }
  | { kind: 'point-critical'; raw: any; title: string; meta: string }
  | { kind: 'maintenance-soon'; raw: any; title: string; meta: string }
  | { kind: 'point-important'; raw: any; title: string; meta: string };

const PriorityActionCard: React.FC<Props> = ({ equipment, onNavigateToTab }) => {
  const { farmId } = useFarmId();
  const [items, setItems] = useState<Item[]>([]);
  const [openTask, setOpenTask] = useState<any>(null);
  const [openPoint, setOpenPoint] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cv = equipment.valeur_actuelle ?? 0;
      const isOverdue = (x: any) => {
        if (x.status === 'completed' || x.status === 'cancelled') return false;
        const th = x.triggerHours ?? x.trigger_hours;
        const tk = x.triggerKilometers ?? x.trigger_kilometers;
        if (x.trigger_unit === 'hours' && th != null) return cv >= th;
        if (x.trigger_unit === 'kilometers' && tk != null) return cv >= tk;
        return x.dueDate ? new Date(x.dueDate) < new Date() : false;
      };

      let tasks: any[] = [];
      try { tasks = await maintenanceService.getTasksForEquipment(Number(equipment.id)) || []; } catch { /* noop */ }

      let points: any[] = [];
      if (farmId) {
        try {
          const eqIdStr = String(equipment.id);
          let { data } = await supabase.from('points').select('*')
            .eq('farm_id', farmId).eq('type', 'equipement').neq('status', 'resolved')
            .eq('entity_id', eqIdStr).order('last_event_at', { ascending: false });
          if ((!data || !data.length) && equipment.name) {
            const fb = await supabase.from('points').select('*')
              .eq('farm_id', farmId).eq('type', 'equipement').neq('status', 'resolved')
              .ilike('entity_label', `%${equipment.name}%`).order('last_event_at', { ascending: false });
            data = fb.data ?? [];
          }
          points = data ?? [];
        } catch { /* noop */ }
      }

      const overdueTasks = tasks.filter(isOverdue);
      const soonTasks = tasks
        .filter((x) => x.status !== 'completed' && x.status !== 'cancelled' && !isOverdue(x))
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      const critPoints = points.filter((p) => p.priority === 'critical');
      const impPoints = points.filter((p) => p.priority === 'important');

      const formatRetard = (t: any) => {
        if (t.dueDate) {
          const d = Math.floor((Date.now() - new Date(t.dueDate).getTime()) / 86400000);
          return `Maintenance · Retard de ${d} j`;
        }
        return 'Maintenance · En retard';
      };
      const formatSoon = (t: any) => {
        if (!t.dueDate) return 'Maintenance · Planifiée';
        const d = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / 86400000);
        if (d <= 0) return 'Maintenance · Aujourd\'hui';
        if (d === 1) return 'Maintenance · Demain';
        return `Maintenance · Dans ${d} j`;
      };

      const all: Item[] = [
        ...overdueTasks.map<Item>((t) => ({ kind: 'maintenance-overdue', raw: t, title: t.title, meta: formatRetard(t) })),
        ...critPoints.map<Item>((p) => ({ kind: 'point-critical', raw: p, title: p.title, meta: 'Point · Critique' })),
        ...soonTasks.slice(0, 3).map<Item>((t) => ({ kind: 'maintenance-soon', raw: t, title: t.title, meta: formatSoon(t) })),
        ...impPoints.map<Item>((p) => ({ kind: 'point-important', raw: p, title: p.title, meta: 'Point · Important' })),
      ];

      if (!cancelled) setItems(all);
    })();
    return () => { cancelled = true; };
  }, [equipment.id, equipment.valeur_actuelle, equipment.name, farmId]);

  const top = items[0];
  const rest = items.length - 1;
  const isMaint = top?.kind === 'maintenance-overdue' || top?.kind === 'maintenance-soon';
  const isOverdue = top?.kind === 'maintenance-overdue';
  const isCritical = top?.kind === 'point-critical';

  const open = () => {
    if (!top) return;
    if (isMaint) setOpenTask(top.raw);
    else setOpenPoint(top.raw);
  };

  const seeAll = () => {
    if (!onNavigateToTab) return;
    if (isMaint) onNavigateToTab('maintenance');
    else onNavigateToTab('points');
  };

  return (
    <Card className={`rounded-2xl border border-border/60 shadow-sm ${
      isOverdue ? 'bg-red-50/60 dark:bg-red-950/20' : isCritical ? 'bg-orange-50/60 dark:bg-orange-950/20' : 'bg-card'
    }`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">À faire sur cette machine</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {!top ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Rien à faire pour le moment.
          </div>
        ) : (
          <>
            <button onClick={open} className="w-full text-left flex items-start gap-3 rounded-xl bg-background/70 border border-border/40 p-3 hover:bg-accent/40 transition-colors">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                isMaint ? 'bg-amber-100 text-amber-700' : isCritical ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {isMaint ? <Wrench className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{top.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{top.meta}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isOverdue && <Badge variant="destructive" className="text-[10px]">En retard</Badge>}
                {isCritical && <Badge className="bg-red-600 text-white text-[10px]">Critique</Badge>}
                {top.kind === 'point-important' && <Badge className="bg-orange-500 text-white text-[10px]">Important</Badge>}
                <Button variant="outline" size="sm" className="h-7 text-xs">Voir</Button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>

            {rest > 0 && (
              <button onClick={seeAll} className="text-xs text-primary font-medium hover:underline w-full text-center">
                + {rest} autre{rest > 1 ? 's' : ''} élément{rest > 1 ? 's' : ''} · Voir toutes les actions à faire →
              </button>
            )}
          </>
        )}
      </CardContent>

      <MaintenanceTaskDetailDialog isOpen={!!openTask} onClose={() => setOpenTask(null)} task={openTask} />
      <PointDetailDialog point={openPoint} open={!!openPoint} onOpenChange={(o) => { if (!o) setOpenPoint(null); }} />
    </Card>
  );
};

export default PriorityActionCard;