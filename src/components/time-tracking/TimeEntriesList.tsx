
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TimeEntryCard } from './TimeEntryCard';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TimeEntry } from '@/hooks/time-tracking/types';

interface TimeEntriesListProps {
  entries: TimeEntry[];
  isLoading: boolean;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onNewSession: () => void;
}

export function TimeEntriesList({
  entries,
  isLoading,
  onResume,
  onDelete,
  onNewSession
}: TimeEntriesListProps) {
  if (isLoading) {
    return (
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
    );
  }

  if (entries.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map((entry) => (
        <TimeEntryCard
          key={entry.id}
          entry={entry}
          onResume={onResume}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
