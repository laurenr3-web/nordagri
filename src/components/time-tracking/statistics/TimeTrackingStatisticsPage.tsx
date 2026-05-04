
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Users,
  Tractor,
  Layers,
  Sparkles,
  ArrowRight,
  Briefcase,
  Wrench,
  PackageX,
  Trophy,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTimeBreakdown } from '@/hooks/time-tracking/useTimeBreakdown';
import { TimeRange, useTimeStatistics } from '@/hooks/time-tracking/useTimeStatistics';
import { formatHoursDecimalToHM } from '@/utils/timeFormat';
import { translateWorkType } from '@/utils/translateWorkType';
import { cn } from '@/lib/utils';

/* -----------------------------------------------------------
 * Helpers
 * --------------------------------------------------------- */

function formatHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return '0h00';
  if (hours < 1 / 60) return '<1 min';
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return formatHoursDecimalToHM(hours);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'U';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return `${first}${last}`.toUpperCase() || 'U';
}

function prettyTaskType(name: string): string {
  return translateWorkType(name);
}

/* -----------------------------------------------------------
 * Sub-components
 * --------------------------------------------------------- */

const PERIOD_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'quarter', label: 'Trimestre' },
];

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: 'green' | 'blue' | 'orange' | 'violet';
  loading?: boolean;
}

const TONE_CLASSES: Record<KpiCardProps['tone'], { bg: string; fg: string; ring: string }> = {
  green:  { bg: 'bg-emerald-50',  fg: 'text-emerald-600',  ring: 'ring-emerald-100' },
  blue:   { bg: 'bg-sky-50',      fg: 'text-sky-600',      ring: 'ring-sky-100' },
  orange: { bg: 'bg-orange-50',   fg: 'text-orange-600',   ring: 'ring-orange-100' },
  violet: { bg: 'bg-violet-50',   fg: 'text-violet-600',   ring: 'ring-violet-100' },
};

const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon, tone, loading }) => {
  const t = TONE_CLASSES[tone];
  return (
    <Card className="rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground line-clamp-1">
              {label}
            </p>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-20" />
            ) : (
              <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground whitespace-nowrap">
                {value}
              </p>
            )}
          </div>
          <div
            className={cn(
              'shrink-0 rounded-xl p-2.5 ring-1',
              t.bg, t.fg, t.ring,
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface RankRowProps {
  leading: React.ReactNode;
  title: string;
  subtitle?: string;
  value: string;
  percent: number; // 0..100
  barClass: string;
}

const RankRow: React.FC<RankRowProps> = ({ leading, title, subtitle, value, percent, barClass }) => (
  <div className="py-3 first:pt-0 last:pb-0">
    <div className="flex items-center gap-3 min-w-0">
      <div className="shrink-0">{leading}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-1">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-foreground whitespace-nowrap">{value}</p>
        <p className="text-[11px] text-muted-foreground whitespace-nowrap">
          {percent.toFixed(0)}%
        </p>
      </div>
    </div>
    <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all', barClass)}
        style={{ width: `${Math.max(2, Math.min(100, percent))}%` }}
      />
    </div>
  </div>
);

const SectionCard: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconTone?: KpiCardProps['tone'];
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, icon, iconTone = 'green', children, className }) => {
  const t = TONE_CLASSES[iconTone];
  return (
    <Card className={cn('rounded-2xl border border-border/60 shadow-sm', className)}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-4 min-w-0">
          {icon && (
            <div className={cn('shrink-0 rounded-xl p-2 ring-1', t.bg, t.fg, t.ring)}>
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground line-clamp-1">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground line-clamp-1">{subtitle}</p>
            )}
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
};

const EmptyCard: React.FC<{ message: string }> = ({ message }) => (
  <div className="py-8 text-center text-sm text-muted-foreground">{message}</div>
);

/* -----------------------------------------------------------
 * Main page
 * --------------------------------------------------------- */

const TimeTrackingStatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [selectedMonth] = useState(new Date());

  const { data: timeBreakdownData, isLoading: isLoadingBreakdown } = useTimeBreakdown();
  const { employeeStats, equipmentStats, hoursSummary, isLoading } = useTimeStatistics();

  // Total hours for the selected period (existing summary keys)
  const totalHours = useMemo(() => {
    switch (timeRange) {
      case 'week':    return hoursSummary.week;
      case 'month':   return hoursSummary.month;
      case 'quarter': return hoursSummary.quarter;
      default:        return 0;
    }
  }, [hoursSummary, timeRange]);

  // ---- Derived: type-of-work ranking (from useTimeBreakdown, in minutes) ----
  const typeRanking = useMemo(() => {
    const total = (timeBreakdownData ?? []).reduce((s, x) => s + (x.minutes || 0), 0);
    return (timeBreakdownData ?? [])
      .filter(x => (x.minutes || 0) > 0)
      .map(x => ({
        name: prettyTaskType(x.task_type),
        hours: (x.minutes || 0) / 60,
        percent: total > 0 ? ((x.minutes || 0) / total) * 100 : 0,
        color: x.color,
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 8);
  }, [timeBreakdownData]);

  // ---- Derived: members ranking ----
  const membersRanking = useMemo(() => {
    const list = (employeeStats ?? []).filter(e => (e.hours || 0) > 0);
    const total = list.reduce((s, x) => s + x.hours, 0);
    const max = list.reduce((m, x) => Math.max(m, x.hours), 0);
    return list
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 8)
      .map(e => ({
        userId: e.userId,
        name: e.employeeName || 'Utilisateur',
        hours: e.hours,
        sessions: e.sessions || 0,
        percent: max > 0 ? (e.hours / max) * 100 : 0,
        share: total > 0 ? (e.hours / total) * 100 : 0,
      }));
  }, [employeeStats]);

  // ---- Derived: equipment ranking ----
  const equipmentRanking = useMemo(() => {
    const list = (equipmentStats ?? []).filter(e => (e.hours || 0) > 0);
    const max = list.reduce((m, x) => Math.max(m, x.hours), 0);
    return list
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 8)
      .map(e => ({
        equipmentId: e.equipmentId,
        name: e.equipmentName && e.equipmentName.trim() && e.equipmentName !== 'Unknown Equipment'
          ? e.equipmentName
          : 'Sans équipement',
        hours: e.hours,
        percent: max > 0 ? (e.hours / max) * 100 : 0,
      }));
  }, [equipmentStats]);

  // ---- Insights ----
  const insights = useMemo(() => {
    const items: { icon: React.ReactNode; text: string }[] = [];
    if (typeRanking[0]) {
      items.push({
        icon: <Layers className="h-4 w-4" />,
        text: `Le plus de temps : ${typeRanking[0].name}`,
      });
    }
    if (membersRanking[0]) {
      items.push({
        icon: <Users className="h-4 w-4" />,
        text: `Membre le plus actif : ${membersRanking[0].name}`,
      });
    }
    if (equipmentRanking[0] && equipmentRanking[0].name !== 'Sans équipement') {
      items.push({
        icon: <Tractor className="h-4 w-4" />,
        text: `Équipement le plus utilisé : ${equipmentRanking[0].name}`,
      });
    }
    return items;
  }, [typeRanking, membersRanking, equipmentRanking]);

  // ---- KPIs ----
  const activeMembers = membersRanking.length;
  const usedEquipments = equipmentRanking.filter(e => e.name !== 'Sans équipement').length;
  const workCategories = typeRanking.length;

  const everythingEmpty =
    !isLoading &&
    !isLoadingBreakdown &&
    totalHours <= 0 &&
    typeRanking.length === 0 &&
    membersRanking.length === 0 &&
    equipmentRanking.length === 0;

  /* -----------------------------------------------------------
   * Empty state
   * --------------------------------------------------------- */
  if (everythingEmpty) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="rounded-2xl border-dashed border-2 border-border/70 bg-emerald-50/30">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Clock className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Aucune donnée de temps</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Les statistiques apparaîtront lorsque des sessions seront enregistrées.
            </p>
            <Button
              onClick={() => navigate('/time-tracking')}
              className="mt-6 rounded-xl"
            >
              Voir le suivi du temps
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* -----------------------------------------------------------
   * Main render
   * --------------------------------------------------------- */
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Temps de travail
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Analyse du temps par membre, équipement et type de travail.
          </p>
        </div>

        {/* Period filter — segmented */}
        <div
          role="tablist"
          aria-label="Période"
          className="inline-flex shrink-0 rounded-xl border border-border bg-card p-1 shadow-sm self-start"
        >
          {PERIOD_OPTIONS.map(opt => {
            const active = timeRange === opt.value;
            return (
              <button
                key={opt.value}
                role="tab"
                aria-selected={active}
                onClick={() => setTimeRange(opt.value)}
                className={cn(
                  'px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          label="Temps total"
          value={formatHours(totalHours)}
          icon={<Clock className="h-5 w-5" />}
          tone="green"
          loading={isLoading}
        />
        <KpiCard
          label="Membres actifs"
          value={String(activeMembers)}
          icon={<Users className="h-5 w-5" />}
          tone="blue"
          loading={isLoading}
        />
        <KpiCard
          label="Équipements"
          value={String(usedEquipments)}
          icon={<Tractor className="h-5 w-5" />}
          tone="orange"
          loading={isLoading}
        />
        <KpiCard
          label="Types de travail"
          value={String(workCategories)}
          icon={<Layers className="h-5 w-5" />}
          tone="violet"
          loading={isLoadingBreakdown}
        />
      </div>

      {/* 3. Analysis grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left — type of work (wide) */}
        <SectionCard
          title="Temps par type de travail"
          subtitle="Répartition du temps par catégorie"
          icon={<Briefcase className="h-4 w-4" />}
          iconTone="violet"
          className="lg:col-span-2"
        >
          {isLoadingBreakdown ? (
            <div className="space-y-4">
              {[0, 1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : typeRanking.length === 0 ? (
            <EmptyCard message="Aucun type de travail enregistré sur la période." />
          ) : (
            <>
              {/* Compact summary */}
              {(() => {
                const totalTypeHours = typeRanking.reduce((s, x) => s + x.hours, 0);
                const principal = typeRanking[0]?.name;
                return (
                  <p className="-mt-2 mb-4 text-xs text-muted-foreground">
                    {formatHours(totalTypeHours)} suivies
                    {principal ? <> · Principal : <span className="font-medium text-foreground">{principal}</span></> : null}
                  </p>
                );
              })()}
              <div className="divide-y divide-border/60">
              {typeRanking
                .filter(t => t.hours > 0)
                .map((t, i) => {
                const color = t.color || 'hsl(var(--primary))';
                return (
                  <div key={`${t.name}-${i}`} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        aria-hidden
                        className="shrink-0 block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <p className="flex-1 min-w-0 text-sm font-medium text-foreground line-clamp-1">
                        {t.name}
                      </p>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                          {formatHours(t.hours)}
                        </p>
                        <p className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {t.percent < 1 ? '<1%' : `${t.percent.toFixed(0)}%`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(2, Math.min(100, t.percent))}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              </div>
            </>
          )}
        </SectionCard>

        {/* Right column — equipment (members live in dedicated card below) */}
        <div className="space-y-4 sm:space-y-6">
          <SectionCard
            title="Temps par équipement"
            subtitle="Utilisation cumulée"
            icon={<Tractor className="h-4 w-4" />}
            iconTone="orange"
          >
            {isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : equipmentRanking.length === 0 ? (
              <EmptyCard message="Aucune session liée à un équipement pour cette période." />
            ) : (
              <div className="divide-y divide-border/60">
                {equipmentRanking.map(eq => (
                  <RankRow
                    key={eq.equipmentId}
                    leading={
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                        {eq.name === 'Sans équipement'
                          ? <PackageX className="h-4 w-4" />
                          : <Wrench className="h-4 w-4" />}
                      </div>
                    }
                    title={eq.name}
                    value={formatHours(eq.hours)}
                    percent={eq.percent}
                    barClass="bg-orange-500/80"
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* 4. Performance par membre — sessions, total, average */}
      <Card className="rounded-2xl border border-sky-200/60 bg-gradient-to-br from-sky-50/60 via-card to-card shadow-sm">
        <CardContent className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start gap-3 mb-1 min-w-0">
            <div className="shrink-0 rounded-xl p-2 ring-1 bg-sky-50 text-sky-600 ring-sky-100">
              <Users className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground line-clamp-1">
                Performance par membre
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Sessions, temps total et moyenne par personne
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map(i => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : membersRanking.length === 0 ? (
            <div className="mt-6 py-8 text-center">
              <p className="text-sm font-medium text-foreground">Aucune donnée par membre</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Les données apparaîtront lorsque des sessions seront enregistrées.
              </p>
            </div>
          ) : (
            (() => {
              const totalMembers = membersRanking.length;
              const totalHoursMembers = membersRanking.reduce((s, m) => s + m.hours, 0);
              const totalSessionsMembers = membersRanking.reduce((s, m) => s + m.sessions, 0);
              const avgPerSession = totalSessionsMembers > 0 ? totalHoursMembers / totalSessionsMembers : 0;
              const top = membersRanking[0];
              const topAvg = top && top.sessions > 0 ? top.hours / top.sessions : 0;
              const others = membersRanking.slice(1);
              return (
                <>
                  {/* A. Mini-KPIs row */}
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="rounded-xl border border-border/60 bg-card px-3 py-2.5 text-center">
                      <p className="text-lg sm:text-xl font-bold text-foreground tabular-nums leading-tight">
                        {totalMembers}
                      </p>
                      <p className="mt-0.5 text-[10px] sm:text-[11px] text-muted-foreground">
                        {totalMembers > 1 ? 'membres' : 'membre'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-card px-3 py-2.5 text-center">
                      <p className="text-lg sm:text-xl font-bold text-foreground tabular-nums leading-tight whitespace-nowrap">
                        {formatHours(totalHoursMembers)}
                      </p>
                      <p className="mt-0.5 text-[10px] sm:text-[11px] text-muted-foreground">temps total</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-card px-3 py-2.5 text-center">
                      <p className="text-lg sm:text-xl font-bold text-foreground tabular-nums leading-tight whitespace-nowrap">
                        {formatHours(avgPerSession)}
                      </p>
                      <p className="mt-0.5 text-[10px] sm:text-[11px] text-muted-foreground">/session</p>
                    </div>
                  </div>

                  {/* B. Top contributor highlight */}
                  {top && (
                    <div className="mt-5">
                      <div className="mb-2 flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Top contributeur
                        </p>
                      </div>
                      <div className="rounded-2xl border border-sky-200/70 bg-sky-50/70 p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white text-sm font-bold shadow-sm ring-2 ring-sky-200">
                            {initials(top.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="truncate text-sm sm:text-base font-semibold text-foreground">
                                {top.name}
                              </p>
                              <span className="shrink-0 rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-semibold text-white whitespace-nowrap">
                                #1
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-sky-900/80">
                              {formatHours(top.hours)} · {top.sessions} session{top.sessions > 1 ? 's' : ''} · moyenne {formatHours(topAvg)}/session
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* C. Other members — simple list, no big bars */}
                  {others.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Autres membres
                      </p>
                      <ul className="divide-y divide-border/60">
                        {others.map(m => {
                          const avg = m.sessions > 0 ? m.hours / m.sessions : 0;
                          return (
                            <li
                              key={m.userId}
                              className="flex items-center gap-3 py-3 min-w-0"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
                                {initials(m.name)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                                <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                                  {m.sessions} session{m.sessions > 1 ? 's' : ''} · {formatHours(avg)}/session
                                </p>
                              </div>
                              <p className="shrink-0 text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                                {formatHours(m.hours)}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </>
              );
            })()
          )}
        </CardContent>
      </Card>

      {/* 5. Insights */}
      {insights.length > 0 && (
        <Card className="rounded-2xl border border-emerald-200/70 bg-emerald-50/50 shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
              <h3 className="text-sm font-semibold text-emerald-900">À retenir</h3>
            </div>
            <ul className="space-y-2">
              {insights.map((it, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-emerald-900/90 min-w-0">
                  <span className="shrink-0 text-emerald-600">{it.icon}</span>
                  <span className="line-clamp-1">{it.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default TimeTrackingStatisticsPage;
