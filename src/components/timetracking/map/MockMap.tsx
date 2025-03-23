
import React, { useEffect, useRef } from 'react';
import { Activity, ActiveTracking } from '@/hooks/timetracking/useTimeTracking';

interface MockMapProps {
  activities: Activity[];
  activeTracking: ActiveTracking | null;
  startTracking: (equipmentId: number, fieldId: number) => void;
  pauseTracking: () => void;
  stopTracking: () => void;
}

const MockMap: React.FC<MockMapProps> = ({
  activities,
  activeTracking,
  startTracking,
  pauseTracking,
  stopTracking
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create placeholder map UI
    mapContainerRef.current.innerHTML = `
      <div class="w-full h-full bg-secondary/20 rounded-lg overflow-hidden relative">
        <div class="absolute inset-0 bg-[url('/placeholder-map.jpg')] bg-cover bg-center opacity-90"></div>
        <div class="absolute bottom-4 right-4 z-10">
          <div class="bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
            <div class="text-xs text-muted-foreground mb-1">Active Equipment</div>
            <div class="flex items-center gap-2">
              <div class="h-3 w-3 rounded-full bg-green-500"></div>
              <span class="text-sm font-medium">John Deere 8R 410</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add mock controls
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg';
    controlsDiv.innerHTML = `
      <div class="flex gap-2">
        ${activeTracking ? `
          ${activeTracking.status === 'active' ? `
            <button id="pause-tracking" class="text-xs flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              Pause
            </button>
          ` : `
            <button id="resume-tracking" class="text-xs flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Resume
            </button>
          `}
          <button id="stop-tracking" class="text-xs flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><rect x="9" y="9" width="6" height="6"></rect></svg>
            Stop
          </button>
        ` : `
          <button id="start-tracking" class="text-xs flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Start Tracking
          </button>
        `}
      </div>
    `;
    
    mapContainerRef.current.appendChild(controlsDiv);
    
    // Add event listeners to mock buttons
    const pauseBtn = document.getElementById('pause-tracking');
    const resumeBtn = document.getElementById('resume-tracking');
    const stopBtn = document.getElementById('stop-tracking');
    const startBtn = document.getElementById('start-tracking');
    
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTracking);
    if (resumeBtn && activities.length > 0) resumeBtn.addEventListener('click', () => {
      const activity = activities[0];
      startTracking(activity.equipmentId, activity.fieldId);
    });
    if (stopBtn) stopBtn.addEventListener('click', stopTracking);
    if (startBtn && activities.length > 0) startBtn.addEventListener('click', () => {
      const activity = activities[0];
      startTracking(activity.equipmentId, activity.fieldId);
    });
  }, [activities, activeTracking, startTracking, pauseTracking, stopTracking]);

  return (
    <div className="relative w-full h-[70vh] rounded-lg bg-secondary/50 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default MockMap;
