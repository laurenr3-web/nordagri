
import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, Square, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimeTracking } from '@/hooks/time-tracking/useTimeTracking';
import { formatDuration } from '@/utils/dateHelpers';
import { cn } from '@/lib/utils';
import { TimeEntryForm } from './TimeEntryForm';

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
  
  const [duration, setDuration] = useState<string>('00:00:00');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Update timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    // Check if active entry exists and is not paused
    if (activeTimeEntry && activeTimeEntry.status === 'active') {
      // Start interval to update timer
      intervalId = setInterval(() => {
        const start = new Date(activeTimeEntry.start_time);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        setDuration(formatDuration(diffMs));
      }, 1000);
      
      // Calculate initial duration
      const start = new Date(activeTimeEntry.start_time);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      setDuration(formatDuration(diffMs));
    } else if (activeTimeEntry && activeTimeEntry.status === 'paused') {
      // For paused entry, just show elapsed time without updates
      const start = new Date(activeTimeEntry.start_time);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      setDuration(formatDuration(diffMs));
    }
    
    // Clean up interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeTimeEntry]);
  
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
  
  // Handle stopping a time entry
  const handleStopTimeEntry = async () => {
    if (activeTimeEntry) {
      try {
        await stopTimeEntry(activeTimeEntry.id);
      } catch (error) {
        console.error("Error stopping time tracking:", error);
      }
    }
  };
  
  // Handle pausing a time entry
  const handlePauseTimeEntry = async () => {
    if (activeTimeEntry) {
      try {
        await pauseTimeEntry(activeTimeEntry.id);
      } catch (error) {
        console.error("Error pausing time tracking:", error);
      }
    }
  };
  
  // Handle resuming a time entry
  const handleResumeTimeEntry = async () => {
    if (activeTimeEntry) {
      try {
        await resumeTimeEntry(activeTimeEntry.id);
      } catch (error) {
        console.error("Error resuming time tracking:", error);
      }
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
        {/* Main button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'rounded-full p-2 h-10 w-10 flex items-center justify-center',
            !activeTimeEntry ? 'text-gray-700' : ''
          )}
          onClick={handleMainButtonClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin">
              <Timer className="h-5 w-5" />
            </div>
          ) : (
            <Clock className="h-5 w-5" />
          )}
        </Button>
        
        {/* Show elapsed time and actions when an entry is active */}
        {activeTimeEntry && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium">{duration}</span>
            
            {/* Actions based on status */}
            {activeTimeEntry.status === 'active' ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-2 h-8 w-8"
                  onClick={handlePauseTimeEntry}
                >
                  <Pause className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-2 h-8 w-8"
                  onClick={handleStopTimeEntry}
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
                  onClick={handleResumeTimeEntry}
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-2 h-8 w-8"
                  onClick={handleStopTimeEntry}
                >
                  <Square className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Modal for form */}
      <TimeEntryForm 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSubmit={handleStartTimeEntry} 
      />
    </>
  );
}
