
import React, { memo } from 'react';
import { MemoizedTimeTrackingButton } from './TimeTrackingButton';

interface TimeTrackerProps {
  className?: string;
}

function TimeTrackerComponent({ className }: TimeTrackerProps) {
  return <MemoizedTimeTrackingButton position="relative" className={className} />;
}

// Use memo to prevent unnecessary re-renders
export const TimeTracker = memo(TimeTrackerComponent);
