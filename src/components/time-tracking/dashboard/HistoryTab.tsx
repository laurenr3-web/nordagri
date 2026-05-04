import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { History, SlidersHorizontal, ChevronDown, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  isToday,
  isYesterday,
  isThisWeek,
  format,
  differenceInSeconds,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { cn } from '@/lib/utils';

interface HistoryTabProps {
  entries: TimeEntry[];
  isLoading: boolean;
  equipments: { id: number; name: string }[];
  dateRange: { from: Date; to: Date };
  setDateRange: (r: { from: Date; to: Date }) => void;
  equipmentFilter?: number;
  setEquipmentFilter: (v: number | undefined) => void;
  taskTypeFilter?: string;
  setTaskTypeFilter: (v: string | undefined) => void;
}

type Period = 'today' | 'week' | 'month' | 'custom';

const TASK_LABELS: Record<string, string> = {
  maintenance: 'Maintenance',
  repair: 'Réparation',
  inspection: 'Inspection',
  operation: 'Opération',
  other: 'Autre',
};

function getInitials(name?: string) {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

function formatDuration(start: string, end?: string | null): string {
  const startD = new Date(start);
  const endD = end ? new Date(end) : new Date();
  if (isNaN(startD.getTime()) || isNaN(endD.getTime())) return 'Durée inconnue';
  const seconds = Math.max(0, differenceInSeconds(endD, startD));
  if (seconds < 60) return '<1 min';
  const totalMinutes = Math.floor(seconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

const INVALID_NAMES = new Set(['self', 'unknown', 'unknown equipment', 'undefined', 'null', '']);

function cleanText(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  if (INVALID_NAMES.has(trimmed.toLowerCase())) return null;
  return trimmed;
}

function resolveMemberName(entry: TimeEntry): string {
  return (
    cleanText(entry.user_name) ||
    cleanText(entry.owner_name) ||
    cleanText(entry.technician) ||
    'Utilisateur'
  );
}

function resolveWorkTitle(entry: TimeEntry): string {
  const intervention = cleanText(entry.intervention_title);
  if (intervention) return intervention;
  if (entry.task_type === 'other') {
    const custom = cleanText(entry.custom_task_type);
    if (custom) return custom;
  }
  const taskLabel = TASK_LABELS[entry.task_type];
  if (taskLabel) return taskLabel;
  return cleanText(entry.description) || cleanText(entry.notes) || 'Session de travail';
}

function resolveContext(entry: TimeEntry): string {
  const equipment = cleanText(entry.equipment_name);
  if (equipment) return equipment;
  if (entry.equipment_id) return 'Équipement non trouvé';
  const poste = cleanText(entry.poste_travail);
  if (poste) return `Poste : ${poste}`;
  const location = cleanText(entry.location);
  if (location) return location;
  return 'Sans équipement';
}

function bucketLabel(date: Date): string {
  if (isToday(date)) return "Aujourd'hui";
  if (isYesterday(date)) return 'Hier';
  if (isThisWeek(date, { weekStartsOn: 1 })) return 'Cette semaine';
  return 'Plus ancien';
}

export function HistoryTab({
  entries,
  isLoading,
  equipments,
  dateRange,
  setDateRange,
  equipmentFilter,
  setEquipmentFilter,
  taskTypeFilter,
  setTaskTypeFilter,
}: HistoryTabProps) {
  const [period, setPeriod] = useState<Period>('week');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [profileNames, setProfileNames] = useState<Record<string, string>>({});

  // Fetch profile names for the user_ids present in entries
  useEffect(() => {
    const ids = Array.from(
      new Set(entries.map((e) => e.user_id).filter(Boolean) as string[]),
    );
    const missing = ids.filter((id) => !(id in profileNames));
    if (missing.length === 0) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', missing);
      if (cancelled || !data) return;
      setProfileNames((prev) => {
        const next = { ...prev };
        for (const p of data) {
          const full = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim();
          if (full) next[p.id] = full;
        }
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [entries, profileNames]);

  const setQuickPeriod = (p: Period) => {
    setPeriod(p);
    const now = new Date();
    if (p === 'today') {
      setDateRange({ from: startOfDay(now), to: endOfDay(now) });
    } else if (p === 'week') {
      setDateRange({
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      });
    } else if (p === 'month') {
      setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
    }
  };

  const reset = () => {
    setQuickPeriod('week');
    setEquipmentFilter(undefined);
    setTaskTypeFilter(undefined);
  };

  const grouped = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
    );
    const buckets: { label: string; items: TimeEntry[] }[] = [];
    const order = ["Aujourd'hui", 'Hier', 'Cette semaine', 'Plus ancien'];
    for (const e of sorted) {
      const label = bucketLabel(new Date(e.start_time));
      let bucket = buckets.find((b) => b.label === label);
      if (!bucket) {
        bucket = { label, items: [] };
        buckets.push(bucket);
      }
      bucket.items.push(e);
    }
    buckets.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
    return buckets;
  }, [entries]);

  const periods: { key: Period; label: string }[] = [
    { key: 'today', label: "Aujourd'hui" },
    { key: 'week', label: 'Semaine' },
    { key: 'month', label: 'Mois' },
  ];

  return (
    <div className="space-y-4 min-w-0">
      {/* Top filter bar */}
      <Card className="rounded-2xl">
        <CardContent className="p-3 sm:p-4 flex flex-wrap items-center gap-2">
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Période rapide"
          >
            {periods.map((p) => (
              <Button
                key={p.key}
                variant={period === p.key ? 'default' : 'outline'}
                size="sm"
                aria-pressed={period === p.key}
                className="rounded-full h-8"
                onClick={() => setQuickPeriod(p.key)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8 gap-1.5"
              onClick={() => setAdvancedOpen((v) => !v)}
              aria-expanded={advancedOpen}
              aria-controls="history-advanced-filters"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              Filtres
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  advancedOpen && 'rotate-180',
                )}
              />
            </Button>
          </div>

          {/* Advanced filters (collapsible) */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="w-full">
            <CollapsibleContent id="history-advanced-filters" className="pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Équipement
                  </label>
                  <Select
                    value={equipmentFilter?.toString() || 'all'}
                    onValueChange={(v) =>
                      setEquipmentFilter(v !== 'all' ? parseInt(v) : undefined)
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {equipments.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id.toString()}>
                          {eq.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Type de travail
                  </label>
                  <Select
                    value={taskTypeFilter || 'all'}
                    onValueChange={(v) => setTaskTypeFilter(v !== 'all' ? v : undefined)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="repair">Réparation</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="operation">Opération</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <Button variant="ghost" size="sm" onClick={reset}>
                  Réinitialiser
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <Card className="rounded-2xl border-dashed">
          <div className="p-10 flex flex-col items-center text-center gap-2">
            <div className="rounded-full bg-muted p-3">
              <History className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-medium">Aucune session trouvée</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Démarrez une session pour commencer à suivre le temps.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6" role="list" aria-label="Sessions de temps groupées par date">
          {grouped.map((bucket) => (
            <section key={bucket.label} className="space-y-2" aria-labelledby={`bucket-${bucket.label}`}>
              <div className="flex items-center gap-2 px-1">
                <h3
                  id={`bucket-${bucket.label}`}
                  className="text-sm font-semibold text-foreground"
                >
                  {bucket.label}
                </h3>
                <span className="text-xs text-muted-foreground">
                  · {bucket.items.length} session{bucket.items.length > 1 ? 's' : ''}
                </span>
              </div>
              <Card className="rounded-2xl overflow-hidden">
                <ul className="divide-y" role="list">
                  {bucket.items.map((entry) => {
                    const name =
                      (entry.user_id && profileNames[entry.user_id]) ||
                      resolveMemberName(entry);
                    const workTitle = resolveWorkTitle(entry);
                    const context = resolveContext(entry);
                    const startTime = format(new Date(entry.start_time), 'HH:mm', {
                      locale: fr,
                    });
                    const isActive = entry.status === 'active' || !entry.end_time;
                    const isPaused = entry.status === 'paused';
                    const endTime = entry.end_time
                      ? format(new Date(entry.end_time), 'HH:mm', { locale: fr })
                      : 'En cours';
                    const duration = formatDuration(entry.start_time, entry.end_time);

                    return (
                      <li
                        key={entry.id}
                        className="px-3 sm:px-4 py-3 flex items-center gap-3 min-w-0 hover:bg-muted/40 transition-colors"
                      >
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                            {getInitials(name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm line-clamp-1">{name}</p>
                          <p className="text-sm text-foreground/80 line-clamp-1 mt-0.5">
                            {workTitle}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {context}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                            <span className="font-medium tabular-nums text-foreground">
                              {startTime} – {endTime}
                            </span>
                            <span className="text-muted-foreground tabular-nums">
                              · {duration}
                            </span>
                          </div>
                          {!isActive && !isPaused && entry.end_time && (
                            <p className="text-[11px] text-muted-foreground/80 mt-0.5 line-clamp-1">
                              Terminée le{' '}
                              {format(new Date(entry.end_time), "d MMM yyyy 'à' HH:mm", {
                                locale: fr,
                              })}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                            {duration}
                          </span>
                          <Badge
                            variant={
                              isActive ? 'default' : isPaused ? 'secondary' : 'outline'
                            }
                            className={cn(
                              'h-5 text-[10px] px-1.5 whitespace-nowrap',
                              isActive && 'bg-emerald-500/15 text-emerald-700 border-0',
                              isPaused && 'bg-amber-500/15 text-amber-700 border-0',
                              !isActive && !isPaused && 'bg-muted text-muted-foreground',
                            )}
                          >
                            {isActive ? 'Active' : isPaused ? 'En pause' : 'Terminée'}
                          </Badge>
                        </div>

                        <Link
                          to={`/time-tracking/detail/${entry.id}`}
                          className="hidden sm:flex shrink-0"
                          aria-label={`Voir le détail de la session de ${name}`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            tabIndex={-1}
                          >
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
