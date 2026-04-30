import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFarmId } from '@/hooks/useFarmId';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useOperationalStats, type StatsPeriod } from '@/hooks/statistics/useOperationalStats';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  CheckCheck,
  Clock,
  Hourglass,
  Trophy,
  Timer,
} from 'lucide-react';

interface PeriodFilterProps {
  value: StatsPeriod;
  onChange: (p: StatsPeriod) => void;
}

function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const options: { id: StatsPeriod; label: string }[] = [
    { id: 'today', label: "Aujourd'hui" },
    { id: 'week', label: 'Semaine' },
    { id: 'month', label: 'Mois' },
  ];
  return (
    <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-muted">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            value === opt.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

function StatCard({ label, value, hint, icon, tone = 'default' }: StatCardProps) {
  const toneClasses: Record<string, string> = {
    default: 'text-foreground',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-destructive',
    info: 'text-primary',
  };
  const iconBg: Record<string, string> = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    danger: 'bg-destructive/10 text-destructive',
    info: 'bg-primary/10 text-primary',
  };
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">
              {label}
            </p>
            <p className={cn('mt-1 text-3xl font-semibold tabular-nums', toneClasses[tone])}>
              {value}
            </p>
            {hint && <p className="mt-1 text-xs text-muted-foreground truncate">{hint}</p>}
          </div>
          <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg', iconBg[tone])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-base font-semibold text-foreground">{children}</h2>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function fmtNumber(n: number | null | undefined, suffix = ''): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const rounded = n >= 10 ? Math.round(n) : Math.round(n * 10) / 10;
  return `${rounded}${suffix}`;
}

interface OperationalOverviewProps {
  period: StatsPeriod;
  onPeriodChange: (p: StatsPeriod) => void;
}

export const OperationalOverview: React.FC<OperationalOverviewProps> = ({ period, onPeriodChange }) => {
  const { farmId } = useFarmId();
  const { data, isLoading } = useOperationalStats(farmId, period);
  const { teamMembers } = useTeamMembers();

  const memberById = useMemo(() => {
    const m = new Map<string, string>();
    for (const tm of teamMembers ?? []) {
      const id = (tm as any).user_id || (tm as any).id;
      if (!id) continue;
      const name = `${tm.first_name ?? ''} ${(tm as any).last_name ?? ''}`.trim() || 'Utilisateur';
      m.set(id, name);
    }
    return m;
  }, [teamMembers]);

  const top = data?.tasks.perEmployee.slice(0, 5) ?? [];
  const topName = data?.tasks.topEmployeeId ? memberById.get(data.tasks.topEmployeeId) ?? 'Membre' : null;

  const periodLabel =
    period === 'today' ? "aujourd'hui" : period === 'week' ? 'cette semaine' : 'ce mois-ci';

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <PeriodFilter value={period} onChange={onPeriodChange} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PeriodFilter value={period} onChange={onPeriodChange} />

      {/* TÂCHES */}
      <section>
        <SectionTitle hint={`Activité des tâches ${periodLabel}.`}>Tâches</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="Complétées"
            value={data.tasks.done}
            icon={<CheckCircle2 className="h-5 w-5" />}
            tone="success"
          />
          <StatCard
            label="En retard"
            value={data.tasks.overdue}
            icon={<AlertTriangle className="h-5 w-5" />}
            tone={data.tasks.overdue > 0 ? 'danger' : 'default'}
          />
          <StatCard
            label="En cours"
            value={data.tasks.inProgress}
            icon={<Loader2 className="h-5 w-5" />}
            tone="info"
          />
        </div>

        {top.length > 0 && (
          <Card className="mt-3">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">
                    {topName ? (
                      <>
                        Plus actif : <span className="text-foreground font-semibold">{topName}</span>
                      </>
                    ) : (
                      'Plus actif'
                    )}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">Tâches complétées</span>
              </div>
              <ul className="space-y-2">
                {top.map((row, idx) => {
                  const name = memberById.get(row.user_id) ?? 'Membre';
                  return (
                    <li key={row.user_id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {idx + 1}
                        </span>
                        <span className="text-sm truncate">{name}</span>
                        {idx === 0 && (
                          <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                            Plus actif
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{row.count}</span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>

      {/* POINTS */}
      <section>
        <SectionTitle hint="État des points à surveiller.">Points à surveiller</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="Ouverts"
            value={data.points.open}
            hint="État actuel"
            icon={<Eye className="h-5 w-5" />}
            tone={data.points.open > 0 ? 'warning' : 'default'}
          />
          <StatCard
            label="Réglés"
            value={data.points.resolved}
            hint={`Sur la période`}
            icon={<CheckCheck className="h-5 w-5" />}
            tone="success"
          />
          <StatCard
            label="Oubliés"
            value={data.points.forgotten}
            hint="Sans activité > 3 j"
            icon={<Clock className="h-5 w-5" />}
            tone={data.points.forgotten > 0 ? 'danger' : 'default'}
          />
        </div>
        <div className="grid grid-cols-1 mt-3">
          <StatCard
            label="Temps moyen de résolution"
            value={fmtNumber(data.points.avgResolutionDays, ' j')}
            hint="Du signalement au règlement"
            icon={<Hourglass className="h-5 w-5" />}
            tone="info"
          />
        </div>
      </section>

      {/* RÉACTIVITÉ */}
      <section>
        <SectionTitle hint="Vitesse de réaction de l'équipe.">Réactivité</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatCard
            label="Avant action sur un point"
            value={fmtNumber(data.reactivity.avgFirstActionHours, ' h')}
            hint="Temps moyen avant 1ʳᵉ action"
            icon={<Timer className="h-5 w-5" />}
            tone="info"
          />
          <StatCard
            label="Pour compléter une tâche"
            value={fmtNumber(data.reactivity.avgCompletionHours, ' h')}
            hint="De la création à la complétion"
            icon={<Timer className="h-5 w-5" />}
            tone="info"
          />
        </div>
      </section>
    </div>
  );
};

export default OperationalOverview;