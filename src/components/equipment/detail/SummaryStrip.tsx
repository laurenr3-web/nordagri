import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Wrench, Eye, Activity } from 'lucide-react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { supabase } from '@/integrations/supabase/client';
import { useFarmId } from '@/hooks/useFarmId';
import { translateRawStatus } from './statusHelpers';

interface SummaryStripProps {
  equipment: EquipmentItem;
}

function relativeDay(d?: string | Date | null): string {
  if (!d) return 'Aucune';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return 'Aucune';
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays <= 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} j`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;
  return `Il y a ${Math.floor(diffDays / 30)} mois`;
}

const SummaryStrip: React.FC<SummaryStripProps> = ({ equipment }) => {
  const { farmId } = useFarmId();
  const [overdueCount, setOverdueCount] = useState(0);
  const [pointsCount, setPointsCount] = useState(0);
  const [lastActivity, setLastActivity] = useState<string | null>(
    typeof equipment.last_wear_update === 'string'
      ? equipment.last_wear_update
      : (equipment.last_wear_update as Date | null)?.toISOString?.() ?? null
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const t = await maintenanceService.getTasksForEquipment(Number(equipment.id));
        if (cancelled) return;
        const cv = equipment.valeur_actuelle ?? 0;
        const isOverdue = (x: any) => {
          if (x.status === 'completed' || x.status === 'cancelled') return false;
          const th = x.triggerHours ?? x.trigger_hours;
          const tk = x.triggerKilometers ?? x.trigger_kilometers;
          if (x.trigger_unit === 'hours' && th != null) return cv >= th;
          if (x.trigger_unit === 'kilometers' && tk != null) return cv >= tk;
          return x.dueDate ? new Date(x.dueDate) < new Date() : false;
        };
        setOverdueCount((Array.isArray(t) ? t : []).filter(isOverdue).length);
        const completed = (Array.isArray(t) ? t : [])
          .filter((x) => x.status === 'completed' && (x.completedDate || x.dueDate))
          .map((x) => new Date(x.completedDate || x.dueDate).getTime());
        const maxCompleted = completed.length ? new Date(Math.max(...completed)).toISOString() : null;
        setLastActivity((prev) => {
          const candidates = [prev, maxCompleted].filter(Boolean) as string[];
          if (!candidates.length) return null;
          return candidates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
        });
      } catch { /* noop */ }
    })();
    return () => { cancelled = true; };
  }, [equipment.id, equipment.valeur_actuelle]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!farmId) return;
      try {
        const eqIdStr = String(equipment.id);
        let { data } = await supabase
          .from('points')
          .select('id')
          .eq('farm_id', farmId)
          .eq('type', 'equipement')
          .neq('status', 'resolved')
          .eq('entity_id', eqIdStr);
        if ((!data || data.length === 0) && equipment.name) {
          const fb = await supabase
            .from('points')
            .select('id')
            .eq('farm_id', farmId)
            .eq('type', 'equipement')
            .neq('status', 'resolved')
            .ilike('entity_label', `%${equipment.name}%`);
          data = fb.data ?? [];
        }
        if (!cancelled) setPointsCount((data ?? []).length);
      } catch { /* noop */ }
    })();
  }, [farmId, equipment.id, equipment.name]);

  const status = translateRawStatus(equipment.status);
  const statusSub =
    status.key === 'active' ? 'Machine prête'
    : status.key === 'watch' ? 'À surveiller'
    : status.key === 'maintenance' ? 'En maintenance'
    : 'Hors service';

  const maintTitle = overdueCount > 0 ? `${overdueCount} en retard` : 'À jour';
  const maintSub = overdueCount > 0 ? 'À faire dès que possible' : 'Aucune en retard';

  const pointsTitle = `${pointsCount} actif${pointsCount > 1 ? 's' : ''}`;
  const pointsSub = pointsCount === 0 ? 'Aucun point actif' : 'À surveiller';

  const activityTitle = relativeDay(lastActivity);
  const activitySub = lastActivity ? 'Compteur ou maintenance' : 'Aucune activité';

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border/60">
        <Cell
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone={status.key === 'active' ? 'green' : status.key === 'watch' ? 'orange' : status.key === 'out_of_service' ? 'red' : 'violet'}
          label="Statut" title={status.label} sub={statusSub}
        />
        <Cell
          icon={<Wrench className="h-4 w-4" />}
          tone={overdueCount > 0 ? 'orange' : 'green'}
          label="Maintenance" title={maintTitle} sub={maintSub}
        />
        <Cell
          icon={<Eye className="h-4 w-4" />}
          tone={pointsCount > 0 ? 'orange' : 'muted'}
          label="Points" title={pointsTitle} sub={pointsSub}
        />
        <Cell
          icon={<Activity className="h-4 w-4" />}
          tone="muted"
          label="Dernière activité" title={activityTitle} sub={activitySub}
        />
      </div>
    </Card>
  );
};

const TONES: Record<string, string> = {
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  muted: 'bg-muted text-muted-foreground',
};

const Cell: React.FC<{ icon: React.ReactNode; tone: string; label: string; title: string; sub: string }> = ({ icon, tone, label, title, sub }) => (
  <div className="flex items-center gap-3 p-4 min-w-0">
    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${TONES[tone] || TONES.muted}`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className="text-sm font-semibold leading-tight truncate">{title}</p>
      <p className="text-[11px] text-muted-foreground truncate">{sub}</p>
    </div>
  </div>
);

export default SummaryStrip;