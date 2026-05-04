import React from 'react';
import { ActiveTimeSession, EmptyActiveSession } from './ActiveTimeSession';
import { QuickStartGrid, QuickStartChoice } from './QuickStartGrid';
import { ActiveTeamCard } from './ActiveTeamCard';
import { RecentSessionsCard } from './RecentSessionsCard';
import { TimeTrackingSummary } from './TimeTrackingSummary';
import { Card } from '@/components/ui/card';
import { BarChart3, ArrowRight } from 'lucide-react';
import { TimeEntry, ActiveTimeEntry } from '@/hooks/time-tracking/types';

interface DayViewTabProps {
  activeTimeEntry: ActiveTimeEntry | null;
  entries: TimeEntry[];
  isLoading: boolean;
  stats: { totalToday: number; totalWeek: number; totalMonth: number };
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onStop: (id: string) => void;
  onNewSession: () => void;
  onQuickStart: (choice: QuickStartChoice) => void;
  onSeeTeam: () => void;
  onSeeHistory: () => void;
  onSeeReports?: () => void;
}

export function DayViewTab({
  activeTimeEntry,
  entries,
  isLoading,
  stats,
  onPause,
  onResume,
  onStop,
  onNewSession,
  onQuickStart,
  onSeeTeam,
  onSeeHistory,
  onSeeReports,
}: DayViewTabProps) {
  const today = new Date();
  const todayEntries = entries.filter((e) => {
    const d = new Date(e.start_time);
    return d.toDateString() === today.toDateString();
  });
  const activeCount = todayEntries.filter(
    (e) => e.status === 'active' || !e.end_time,
  ).length;
  const completedCount = todayEntries.filter(
    (e) => e.status === 'completed' && e.end_time,
  ).length;

  const reportsCard = (
    <Card className="rounded-2xl shadow-sm w-full">
      <button
        type="button"
        onClick={onSeeReports}
        className="w-full text-left p-5 sm:p-6 flex items-start gap-4 group"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
          <BarChart3 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">Rapports disponibles</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Consulte le temps par membre, équipement ou type de travail.
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs text-primary font-medium">
            Voir les rapports
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </button>
    </Card>
  );

  return (
    <div className="min-w-0 grid gap-5 lg:gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.9fr)] items-start">
      {/* Left column */}
      <div className="flex flex-col gap-5 lg:gap-6 min-w-0 order-2 lg:order-1">
        {activeTimeEntry ? (
          <ActiveTimeSession
            session={activeTimeEntry}
            onPause={onPause}
            onResume={onResume}
            onStop={onStop}
          />
        ) : (
          <EmptyActiveSession onStart={onNewSession} />
        )}
        <QuickStartGrid onPick={onQuickStart} onCustom={onNewSession} />
        <RecentSessionsCard
          entries={todayEntries}
          isLoading={isLoading}
          onSeeAll={onSeeHistory}
          maxDesktop={4}
        />
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-5 lg:gap-6 min-w-0 order-1 lg:order-2">
        <ActiveTeamCard onSeeAll={onSeeTeam} />
        <TimeTrackingSummary
          stats={stats}
          isLoading={isLoading}
          activeCount={activeCount}
          completedCount={completedCount}
        />
        {reportsCard}
      </div>
    </div>
  );
}