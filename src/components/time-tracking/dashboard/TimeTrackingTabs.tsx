
import React from 'react';
import { Calendar, ListFilter, PieChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TimeEntryCard } from '@/components/time-tracking/TimeEntryCard';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { Skeleton } from '@/components/ui/skeleton';
import CalendarView from '@/components/time-tracking/calendar/CalendarView';
import TimeTrackingRapport from '@/components/time-tracking/rapport/TimeTrackingRapport';

interface TimeTrackingTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  entries: TimeEntry[];
  isLoading: boolean;
  onNewSession: () => void;
  onResumeEntry: (entryId: string) => void;
  onDeleteEntry: (entryId: string) => void;
}

export function TimeTrackingTabs({
  activeTab,
  onTabChange,
  entries,
  isLoading,
  onNewSession,
  onResumeEntry,
  onDeleteEntry,
}: TimeTrackingTabsProps) {
  return (
    <Tabs 
      defaultValue={activeTab} 
      value={activeTab}
      onValueChange={onTabChange}
      className="mt-6"
    >
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-1">
            <ListFilter className="h-4 w-4" />
            <span>Liste</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Calendrier</span>
          </TabsTrigger>
          <TabsTrigger value="rapport" className="flex items-center gap-1">
            <PieChart className="h-4 w-4" />
            <span>Rapport</span>
          </TabsTrigger>
        </TabsList>
        
        <Button size="sm" onClick={onNewSession} disabled={isLoading}>
          Nouvelle session
        </Button>
      </div>
      
      <TabsContent value="list" className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">Aucune session de travail enregistrée</p>
            <Button onClick={onNewSession}>Démarrer une nouvelle session</Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-24rem)]">
            <div className="space-y-4">
              {entries.map((entry) => (
                <TimeEntryCard
                  key={entry.id}
                  entry={entry}
                  onResume={() => onResumeEntry(entry.id)}
                  onDelete={() => onDeleteEntry(entry.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </TabsContent>
      
      <TabsContent value="calendar">
        <CalendarView />
      </TabsContent>
      
      <TabsContent value="rapport">
        <TimeTrackingRapport />
      </TabsContent>
    </Tabs>
  );
}

