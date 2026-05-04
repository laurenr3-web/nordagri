import { EquipmentItem } from '../hooks/useEquipmentFilters';

export type GlobalStatus = 'active' | 'watch' | 'maintenance' | 'out_of_service';

export interface StatusInfo {
  key: GlobalStatus;
  label: string;
  badgeClass: string;
  dotClass: string;
  ringClass: string;
}

export const STATUS_MAP: Record<GlobalStatus, StatusInfo> = {
  active: {
    key: 'active',
    label: 'Actif',
    badgeClass: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900',
    dotClass: 'bg-green-500',
    ringClass: 'ring-green-200',
  },
  watch: {
    key: 'watch',
    label: 'À surveiller',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-900',
    dotClass: 'bg-orange-500',
    ringClass: 'ring-orange-200',
  },
  maintenance: {
    key: 'maintenance',
    label: 'Maintenance',
    badgeClass: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-900',
    dotClass: 'bg-violet-500',
    ringClass: 'ring-violet-200',
  },
  out_of_service: {
    key: 'out_of_service',
    label: 'Hors service',
    badgeClass: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900',
    dotClass: 'bg-red-500',
    ringClass: 'ring-red-200',
  },
};

export function translateRawStatus(raw?: string | null): StatusInfo {
  const v = (raw || '').toLowerCase();
  if (['broken', 'out_of_service', 'hors service', 'hors_service'].includes(v)) return STATUS_MAP.out_of_service;
  if (['maintenance', 'in_maintenance'].includes(v)) return STATUS_MAP.maintenance;
  if (['watch', 'a_surveiller', 'à surveiller'].includes(v)) return STATUS_MAP.watch;
  return STATUS_MAP.active;
}

export interface GlobalStatusContext {
  equipment: EquipmentItem;
  hasOverdueMaintenance: boolean;
  hasCriticalPoint: boolean;
}

export function computeGlobalStatus({ equipment, hasOverdueMaintenance, hasCriticalPoint }: GlobalStatusContext): StatusInfo {
  const raw = translateRawStatus(equipment.status);
  if (raw.key === 'out_of_service') return raw;
  if (hasOverdueMaintenance) return STATUS_MAP.maintenance;
  if (hasCriticalPoint) return STATUS_MAP.watch;
  if (raw.key === 'maintenance') return STATUS_MAP.maintenance;
  return STATUS_MAP.active;
}

export function unitShort(unit?: string | null): string {
  const u = (unit || 'heures').toLowerCase();
  if (u === 'heures' || u === 'hours') return 'h';
  if (u === 'kilometres' || u === 'kilometers' || u === 'km') return 'km';
  if (u === 'acres') return 'ac';
  return u;
}

export function formatCounter(value?: number | null, unit?: string | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Non renseigné';
  return `${value} ${unitShort(unit)}`;
}