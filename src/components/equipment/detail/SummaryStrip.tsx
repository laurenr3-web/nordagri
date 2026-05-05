import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Wrench, Eye, Activity } from 'lucide-react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { translateRawStatus } from './statusHelpers';
import { useEquipmentSnapshot } from './useEquipmentSnapshot';

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
  const snap = useEquipmentSnapshot(equipment);
  const overdueCount = snap.overdueTasks.length;
  const pointsCount = snap.activePoints.length;
  const lastActivity = snap.lastActivity;

  const status = translateRawStatus(equipment.status);
  const statusSub =
    status.key === 'active' ? 'Machine prête'
    : status.key === 'watch' ? 'À surveiller'
    : status.key === 'maintenance' ? 'En maintenance'
    : 'Hors service';

  const maintTitle = overdueCount > 0 ? `${overdueCount} en retard` : 'À jour';
  const maintSub = overdueCount > 0 ? 'À faire' : 'Aucune en retard';

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
      <p className="eq-label">{label}</p>
      <p className="eq-item-title font-semibold">{title}</p>
      <p className="eq-meta text-[11px]">{sub}</p>
    </div>
  </div>
);

export default SummaryStrip;