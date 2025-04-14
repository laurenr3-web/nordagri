
import React from 'react';
import { TimeTrackingButton } from './TimeTrackingButton';

interface TimeTrackerProps {
  className?: string;
}

export function TimeTracker({ className }: TimeTrackerProps) {
  return <TimeTrackingButton position="relative" className={className} />;
}
