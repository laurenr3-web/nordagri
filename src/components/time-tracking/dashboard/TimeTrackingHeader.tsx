
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface TimeTrackingHeaderProps {
  onNewSession: () => void;
}

export function TimeTrackingHeader({ onNewSession }: TimeTrackingHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold">Time Tracking</h1>
      <Button 
        id="start-time-session-btn"
        onClick={onNewSession} 
        className="bg-green-600 hover:bg-green-700"
      >
        <Clock className="h-4 w-4 mr-2" />
        New Session
      </Button>
    </div>
  );
}
