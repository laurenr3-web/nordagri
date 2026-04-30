import { PointEventType, PointPriority, PointStatus, PointType } from '@/types/Point';

export const STATUS_LABELS: Record<PointStatus, string> = {
  open: 'En cours',
  watch: 'À surveiller',
  resolved: 'Réglé',
};

export const PRIORITY_LABELS: Record<PointPriority, string> = {
  critical: 'Critique',
  important: 'Important',
  normal: 'Normal',
};

export const TYPE_LABELS: Record<PointType, string> = {
  animal: 'Animal',
  equipement: 'Équipement',
  champ: 'Champ',
  batiment: 'Bâtiment',
  autre: 'Autre',
};

export const TYPE_EMOJI: Record<PointType, string> = {
  animal: '🐄',
  equipement: '🚜',
  champ: '🌾',
  batiment: '🏠',
  autre: '📌',
};

export const EVENT_LABELS: Record<PointEventType, string> = {
  observation: 'Observation',
  action: 'Action',
  verification: 'Vérification',
  note: 'Note',
  correction: 'Correction',
};

export const EVENT_EMOJI: Record<PointEventType, string> = {
  observation: '👀',
  action: '🔧',
  verification: '✅',
  note: '📝',
  correction: '⚠️',
};

export type Freshness = 'fresh' | 'recent' | 'stale';

export function freshnessOf(lastEventAt: string | null | undefined): Freshness {
  if (!lastEventAt) return 'stale';
  const days = (Date.now() - new Date(lastEventAt).getTime()) / 86400000;
  if (days < 1) return 'fresh';
  if (days <= 3) return 'recent';
  return 'stale';
}

export const FRESHNESS_DOT: Record<Freshness, string> = {
  fresh: 'bg-emerald-500',
  recent: 'bg-amber-500',
  stale: 'bg-rose-500',
};

export function daysOpen(createdAt: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000));
}

export function relativeFromNow(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `il y a ${d} j`;
  const mo = Math.floor(d / 30);
  return `il y a ${mo} mois`;
}

export type NextCheckKind = 'none' | 'soon' | 'today' | 'overdue';

export interface NextCheckState {
  kind: NextCheckKind;
  label: string;
  shortLabel: string;
  badgeClass: string;
}

/**
 * Compute the display state of a point's `next_check_at`.
 * - overdue: scheduled date already passed (and not today)
 * - today: scheduled for today
 * - soon: scheduled in the future
 * - none: no scheduled check
 */
export function nextCheckState(nextCheckAt: string | null | undefined): NextCheckState {
  if (!nextCheckAt) {
    return { kind: 'none', label: '', shortLabel: '', badgeClass: '' };
  }
  const target = new Date(nextCheckAt);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.round(
    (startOfTarget.getTime() - startOfToday.getTime()) / 86400000
  );
  const formatted = target.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  if (diffDays < 0) {
    const late = Math.abs(diffDays);
    return {
      kind: 'overdue',
      label: `En retard de ${late} j`,
      shortLabel: `En retard (${late} j)`,
      badgeClass:
        'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    };
  }
  if (diffDays === 0) {
    return {
      kind: 'today',
      label: 'À vérifier aujourd’hui',
      shortLabel: 'Aujourd’hui',
      badgeClass:
        'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    };
  }
  return {
    kind: 'soon',
    label: `À vérifier le ${formatted}`,
    shortLabel: `À vérifier le ${formatted}`,
    badgeClass:
      'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  };
}

export const PRIORITY_BADGE_CLASS: Record<PointPriority, string> = {
  critical: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  important: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  normal: 'bg-muted text-muted-foreground border-border',
};

export const STATUS_BADGE_CLASS: Record<PointStatus, string> = {
  open: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  watch: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  resolved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
};