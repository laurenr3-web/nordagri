import React, { useMemo, useState } from 'react';
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
  differenceInMinutes,
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

function formatDuration(start: string, end?: string | null) {
  const startD = new Date(start);
  const endD = end ? new Date(end) : new Date();
  const minutes = Math.max(0, differenceInMinutes(endD, startD));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m.toString().padStart(2, '0')}`;
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
                      entry.user_name || entry.owner_name || entry.technician || 'Membre';
                    const taskLabel =
                      entry.task_type === 'other'
                        ? entry.custom_task_type || 'Autre'
                        : TASK_LABELS[entry.task_type] || entry.task_type;
                    const context =
                      entry.equipment_name || entry.poste_travail || entry.location || null;
                    const startTime = format(new Date(entry.start_time), 'HH:mm', {
                      locale: fr,
                    });
                    const endTime = entry.end_time
                      ? format(new Date(entry.end_time), 'HH:mm', { locale: fr })
                      : 'En cours';
                    const duration = formatDuration(entry.start_time, entry.end_time);
                    const isActive = entry.status === 'active';
                    const isPaused = entry.status === 'paused';

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
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            <span className="font-medium text-foreground/80">
                              {taskLabel}
                            </span>
                            {context ? <> · {context}</> : null}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {startTime} – {endTime}
                          </p>
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
