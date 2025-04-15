
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, StopCircle } from 'lucide-react';

interface SessionControlsProps {
  status: 'active' | 'paused' | 'completed';
  onPauseResume: () => void;
  onStop: () => void;
}

export const SessionControls = ({ status, onPauseResume, onStop }: SessionControlsProps) => {
  if (status === 'completed') return null;
  
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={onPauseResume}
      >
        {status === 'active' ? (
          <><Pause className="mr-2 h-4 w-4" /> Pause</>
        ) : (
          <><Play className="mr-2 h-4 w-4" /> Reprendre</>
        )}
      </Button>
      <Button
        variant="destructive"
        onClick={onStop}
      >
        <StopCircle className="mr-2 h-4 w-4" />
        Terminer
      </Button>
    </div>
  );
};
