
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, Square } from 'lucide-react';
import { TimeEntryStatus } from '@/hooks/time-tracking/types';

interface SessionControlsProps {
  status: TimeEntryStatus;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function SessionControls({ status, onPause, onResume, onStop }: SessionControlsProps) {
  // If the status is completed or disputed, don't show any controls
  if (status === 'completed' || status === 'disputed') {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {status === 'active' ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full p-2 h-8 w-8"
            onClick={onPause}
          >
            <Pause className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full p-2 h-8 w-8"
            onClick={onStop}
          >
            <Square className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full p-2 h-8 w-8"
            onClick={onResume}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full p-2 h-8 w-8"
            onClick={onStop}
          >
            <Square className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
