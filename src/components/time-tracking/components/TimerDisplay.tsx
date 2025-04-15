
import React from 'react';

interface TimerDisplayProps {
  duration: string;
}

export function TimerDisplay({ duration }: TimerDisplayProps) {
  return (
    <span className="font-mono text-sm font-medium">
      {duration}
    </span>
  );
}
