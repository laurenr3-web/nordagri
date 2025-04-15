
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTimeTracking } from '@/hooks/time-tracking/useTimeTracking';
import { TimeEntryForm } from './TimeEntryForm';
import { MainButton } from './button/MainButton';
import { SessionControls } from './button/SessionControls';
import { useTimeTrackingTimer } from '@/hooks/time-tracking/useTimer';

interface TimeTrackingButtonProps {
  className?: string;
  position?: 'fixed' | 'relative';
}

export function TimeTrackingButton({ 
  className, 
  position = 'fixed' 
}: TimeTrackingButtonProps) {
  const { 
    activeTimeEntry, 
    isLoading,
    startTimeEntry,
    stopTimeEntry,
    pauseTimeEntry,
    resumeTimeEntry
  } = useTimeTracking();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const duration = useTimeTrackingTimer(activeTimeEntry);
  
  // Handle main button click
  const handleMainButtonClick = () => {
    if (!activeTimeEntry) {
      setIsFormOpen(true);
    }
  };
  
  // Handle starting a time entry
  const handleStartTimeEntry = async (data: any) => {
    try {
      await startTimeEntry(data);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error starting time tracking:", error);
    }
  };
  
  // Determine color class based on status
  const getColorClass = () => {
    if (!activeTimeEntry) return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    
    switch (activeTimeEntry.status) {
      case 'active':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'paused':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };
  
  return (
    <>
      <div 
        className={cn(
          'flex items-center gap-2 z-50',
          position === 'fixed' ? 'fixed bottom-20 right-4 shadow-lg rounded-full p-2' : '',
          getColorClass(),
          className
        )}
      >
        <MainButton 
          onClick={handleMainButtonClick}
          isLoading={isLoading}
        />
        
        {activeTimeEntry && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium">{duration}</span>
            <SessionControls
              status={activeTimeEntry.status}
              onPause={pauseTimeEntry}
              onResume={resumeTimeEntry}
              onStop={stopTimeEntry}
            />
          </div>
        )}
      </div>
      
      <TimeEntryForm 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSubmit={handleStartTimeEntry} 
      />
    </>
  );
}
