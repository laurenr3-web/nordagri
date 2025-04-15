
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListFilter, CalendarIcon, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { TimeEntryCard } from '../TimeEntryCard';

interface TimeTrackingTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  entries: TimeEntry[];
  isLoading: boolean;
  onNewSession: () => void;
  onResumeEntry: (id: string) => void;
  onDeleteEntry: (id: string) => void;
}

export function TimeTrackingTabs({
  activeTab,
  onTabChange,
  entries,
  isLoading,
  onNewSession,
  onResumeEntry,
  onDeleteEntry
}: TimeTrackingTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mt-6">
      <TabsList className="mb-4">
        <TabsTrigger value="list">
          <ListFilter className="h-4 w-4 mr-2" />
          List
        </TabsTrigger>
        <TabsTrigger value="calendar">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Calendar
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="list">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <div className="p-4">
                    <Skeleton className="h-6 w-24 mb-3" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          entries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entries.map((entry) => (
                <TimeEntryCard
                  key={entry.id}
                  entry={entry}
                  onResume={onResumeEntry}
                  onDelete={onDeleteEntry}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md bg-gray-50">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium mb-2">No sessions found</h3>
              <p className="text-gray-500 mb-4">
                No time sessions match your search criteria.
              </p>
              <Button onClick={onNewSession}>
                Start a session
              </Button>
            </div>
          )
        )}
      </TabsContent>
      
      <TabsContent value="calendar">
        <div className="border rounded-lg p-6">
          <div className="text-center">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Calendar View</h3>
            <p className="text-gray-500 mb-4">
              This feature will be available soon.
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
