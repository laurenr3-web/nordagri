import React from 'react';
import { ActiveTimeSession, EmptyActiveSession } from './ActiveTimeSession';
import { QuickStartGrid, QuickStartChoice } from './QuickStartGrid';
import { ActiveTeamCard } from './ActiveTeamCard';
import { RecentSessionsCard } from './RecentSessionsCard';
import { TimeTrackingSummary } from './TimeTrackingSummary';
import { WorkTypeChartCard } from './WorkTypeChartCard';
import { DailyTipBanner } from './DailyTipBanner';
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

  return (
    <div className="flex flex-col gap-4 sm:gap-5 min-w-0">
      {/* Top row: Active session | Active team | Quick start */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 min-w-0 items-stretch">
        <div className="lg:col-span-5 min-w-0 order-1 flex">
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
        </div>
        <div className="lg:col-span-4 min-w-0 order-3 lg:order-2 flex">
          <ActiveTeamCard onSeeAll={onSeeTeam} />
        </div>
        <div className="lg:col-span-3 min-w-0 order-2 lg:order-3 flex">
          <QuickStartGrid onPick={onQuickStart} onCustom={onNewSession} />
        </div>
      </div>

      {/* Bottom row: Summary | Recent sessions | Work type chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 min-w-0 items-stretch">
        <div className="lg:col-span-3 min-w-0 order-1 flex">
          <TimeTrackingSummary
            stats={stats}
            isLoading={isLoading}
            activeCount={activeCount}
            completedCount={completedCount}
          />
        </div>
        <div className="lg:col-span-5 min-w-0 order-2 flex">
          <RecentSessionsCard
            entries={todayEntries}
            isLoading={isLoading}
            onSeeAll={onSeeHistory}
          />
        </div>
        <div className="lg:col-span-4 min-w-0 order-3 flex">
          <WorkTypeChartCard />
        </div>
      </div>

      <DailyTipBanner />
    </div>
  );
}