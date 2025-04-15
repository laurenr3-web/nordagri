
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pause, Play, Square } from 'lucide-react';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { formatDuration } from '@/utils/dateHelpers';

interface ActiveSessionsTableProps {
  sessions: TimeEntry[];
  onPause: (sessionId: string) => void;
  onResume: (sessionId: string) => void;
  onStop: (sessionId: string) => void;
}

export function ActiveSessionsTable({ 
  sessions,
  onPause,
  onResume,
  onStop
}: ActiveSessionsTableProps) {
  if (sessions.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Active Sessions</h3>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => {
              // Calculate duration
              const start = new Date(session.start_time);
              const now = new Date();
              const diffMs = now.getTime() - start.getTime();
              const duration = formatDuration(diffMs);
              
              return (
                <TableRow key={session.id}>
                  <TableCell>{session.user_name || 'Anonymous'}</TableCell>
                  <TableCell className="font-mono">{duration}</TableCell>
                  <TableCell>
                    {session.status === 'active' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In Progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Paused
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {session.status === 'active' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPause(session.id)}
                        className="mr-2"
                      >
                        <Pause className="h-4 w-4" />
                        <span className="sr-only">Pause</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResume(session.id)}
                        className="mr-2"
                      >
                        <Play className="h-4 w-4" />
                        <span className="sr-only">Resume</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStop(session.id)}
                    >
                      <Square className="h-4 w-4" />
                      <span className="sr-only">Stop</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
