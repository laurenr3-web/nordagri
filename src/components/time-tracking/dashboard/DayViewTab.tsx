import React from 'react';
import { ActiveTimeSession, EmptyActiveSession } from './ActiveTimeSession';
import { QuickStartGrid, QuickStartChoice } from './QuickStartGrid';
import { ActiveTeamCard } from './ActiveTeamCard';
import { RecentSessionsCard } from './RecentSessionsCard';
import { TimeTrackingSummary } from './TimeTrackingSummary';
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 min-w-0">
      <div className="lg:col-span-8 min-w-0 space-y-4 sm:space-y-5">
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
        />
      </div>
      <div className="lg:col-span-4 min-w-0 space-y-4 sm:space-y-5">
        <TimeTrackingSummary
          stats={stats}
          isLoading={isLoading}
          activeCount={activeCount}
          completedCount={completedCount}
        />
        <ActiveTeamCard onSeeAll={onSeeTeam} />
      </div>
    </div>
  );
}