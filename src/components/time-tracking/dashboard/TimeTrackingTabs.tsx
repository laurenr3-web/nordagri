import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar, Users, History, BarChart3 } from 'lucide-react';
import { DayViewTab } from './DayViewTab';
import { TeamSection } from '@/components/time-tracking/team/TeamSection';
import { HistoryTab } from './HistoryTab';
import TimeTrackingRapport from '@/components/time-tracking/rapport/TimeTrackingRapport';
import { WorkTypeChartCard } from './WorkTypeChartCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { TimeEntry, ActiveTimeEntry } from '@/hooks/time-tracking/types';
import { QuickStartChoice } from './QuickStartGrid';

interface TimeTrackingTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeTimeEntry: ActiveTimeEntry | null;
  entries: TimeEntry[];
  isLoading: boolean;
  stats: { totalToday: number; totalWeek: number; totalMonth: number };
  equipments: { id: number; name: string }[];
  dateRange: { from: Date; to: Date };
  setDateRange: (r: { from: Date; to: Date }) => void;
  equipmentFilter?: number;
  setEquipmentFilter: (v: number | undefined) => void;
  taskTypeFilter?: string;
  setTaskTypeFilter: (v: string | undefined) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onStop: (id: string) => void;
  onNewSession: () => void;
  onQuickStart: (choice: QuickStartChoice) => void;
}

const TABS = [
  { value: 'day', label: 'Vue du jour', icon: Calendar },
  { value: 'team', label: 'Équipe', icon: Users },
  { value: 'history', label: 'Historique', icon: History },
  { value: 'reports', label: 'Rapports', icon: BarChart3 },
];

export function TimeTrackingTabs(props: TimeTrackingTabsProps) {
  const isMobile = useIsMobile();
  const { activeTab, onTabChange } = props;

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 h-auto bg-transparent p-0 border-b rounded-none gap-1 sm:gap-0">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs sm:text-sm font-medium"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{t.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="day" className="mt-4 sm:mt-6">
        <DayViewTab
          activeTimeEntry={props.activeTimeEntry}
          entries={props.entries}
          isLoading={props.isLoading}
          stats={props.stats}
          onPause={props.onPause}
          onResume={props.onResume}
          onStop={props.onStop}
          onNewSession={props.onNewSession}
          onQuickStart={props.onQuickStart}
          onSeeTeam={() => onTabChange('team')}
          onSeeHistory={() => onTabChange('history')}
        />
      </TabsContent>

      <TabsContent value="team" className="mt-4 sm:mt-6">
        <TeamSection />
      </TabsContent>

      <TabsContent value="history" className="mt-4 sm:mt-6">
        <HistoryTab
          entries={props.entries}
          isLoading={props.isLoading}
          equipments={props.equipments}
          dateRange={props.dateRange}
          setDateRange={props.setDateRange}
          equipmentFilter={props.equipmentFilter}
          setEquipmentFilter={props.setEquipmentFilter}
          taskTypeFilter={props.taskTypeFilter}
          setTaskTypeFilter={props.setTaskTypeFilter}
        />
      </TabsContent>

      <TabsContent value="reports" className="mt-4 sm:mt-6 space-y-4">
        {isMobile && <WorkTypeChartCard />}
        <TimeTrackingRapport />
      </TabsContent>
    </Tabs>
  );
}
