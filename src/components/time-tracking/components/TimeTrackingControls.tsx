
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, Square } from 'lucide-react';

interface TimeTrackingControlsProps {
  status: 'active' | 'paused';
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function TimeTrackingControls({
  status,
  onPause,
  onResume,
  onStop
}: TimeTrackingControlsProps) {
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
            title="Terminer et aller à la page de clôture"
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
            title="Terminer et aller à la page de clôture"
          >
            <Square className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
