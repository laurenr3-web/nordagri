
import React, { useState, useCallback, memo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTimeTracking } from '@/hooks/time-tracking/useTimeTracking';
import { useTimer } from '@/hooks/time-tracking/useTimer';
import { TimeEntryForm } from './TimeEntryForm';
import { MainButton } from './components/MainButton';
import { TimerDisplay } from './components/TimerDisplay';
import { TimeTrackingControls } from './components/TimeTrackingControls';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface TimeTrackingButtonProps {
  className?: string;
  position?: 'fixed' | 'relative';
}

// Create memoized components for better performance
const MemoizedTimerDisplay = memo(TimerDisplay);
const MemoizedTimeTrackingControls = memo(TimeTrackingControls);

function TimeTrackingButtonComponent({ 
  className, 
  position = 'fixed' 
}: TimeTrackingButtonProps) {
  const navigate = useNavigate();
  const { 
    activeTimeEntry, 
    isLoading, 
    startTimeEntry, 
    pauseTimeEntry,
    resumeTimeEntry,
    refreshActiveTimeEntry
  } = useTimeTracking();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const duration = useTimer(activeTimeEntry);

  // Periodically check for active sessions to ensure synchronization
  useEffect(() => {
    if (!activeTimeEntry) return; // Only check if there's an active session
    
    const checkInterval = setInterval(() => {
      if (!isLoading && document.visibilityState === 'visible') {
        refreshActiveTimeEntry();
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(checkInterval);
  }, [isLoading, refreshActiveTimeEntry, activeTimeEntry]);
  
  // Use useCallback to prevent unnecessary re-renders
  const handleMainButtonClick = useCallback(() => {
    if (!activeTimeEntry) {
      setIsFormOpen(true);
    }
  }, [activeTimeEntry]);
  
  const handleStartTimeEntry = useCallback(async (data: any) => {
    try {
      await startTimeEntry(data);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error starting time tracking:", error);
    }
  }, [startTimeEntry]);

  const handleStopTimeEntry = useCallback((entryId: string) => {
    try {
      // Rediriger vers la page de détail de la session au lieu de terminer directement
      navigate(`/time-tracking/detail/${entryId}`);
      toast.info("Accès à la page de clôture de la session");
    } catch (error) {
      console.error("Error navigating to time entry detail:", error);
      toast.error("Impossible d'accéder à la page de clôture");
    }
  }, [navigate]);
  
  const handlePauseTimeEntry = useCallback((id: string) => {
    pauseTimeEntry(id);
  }, [pauseTimeEntry]);
  
  const handleResumeTimeEntry = useCallback((id: string) => {
    resumeTimeEntry(id);
  }, [resumeTimeEntry]);
  
  const getColorClass = useCallback(() => {
    if (!activeTimeEntry) return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    
    switch (activeTimeEntry.status) {
      case 'active':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'paused':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  }, [activeTimeEntry]);

  // Don't render anything when there's no active timer and we're not showing
  // a fixed button
  if (!activeTimeEntry && position !== 'fixed') {
    return null;
  }
  
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
          isLoading={isLoading}
          onClick={handleMainButtonClick}
          disabled={isLoading}
        />
        
        {activeTimeEntry && (
          <div className="flex items-center gap-2">
            <MemoizedTimerDisplay duration={duration} />
            
            <MemoizedTimeTrackingControls
              status={activeTimeEntry.status as 'active' | 'paused'}
              onPause={() => handlePauseTimeEntry(activeTimeEntry.id)}
              onResume={() => handleResumeTimeEntry(activeTimeEntry.id)}
              onStop={() => handleStopTimeEntry(activeTimeEntry.id)}
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

// Export a memoized version
export const TimeTrackingButton = memo(TimeTrackingButtonComponent);
export const MemoizedTimeTrackingButton = memo(TimeTrackingButtonComponent);
