
import React from 'react';
import { Activity, ActiveTracking } from '@/hooks/timetracking/useTimeTracking';
import { Button } from '@/components/ui/button';
import { Play, Pause, StopCircle } from 'lucide-react';

interface MapControlsProps {
  activeTracking: ActiveTracking | null;
  mapRef: any;
  pauseTracking: () => void;
  stopTracking: () => void;
  startTracking: (equipmentId: number, fieldId: number) => void;
  activities: Activity[];
}

const MapControls: React.FC<MapControlsProps> = ({
  activeTracking,
  mapRef,
  pauseTracking,
  stopTracking,
  startTracking,
  activities
}) => {
  if (!activeTracking) return null;

  return (
    <div className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
      <div className="flex gap-2">
        {activeTracking.status === 'active' ? (
          <Button 
            variant="outline" 
            size="sm"
            className="gap-1"
            onClick={pauseTracking}
          >
            <Pause size={14} />
            <span>Pause</span>
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            className="gap-1"
            onClick={() => {
              if (activities.length > 0) {
                const activity = activities.find(a => a.id === activeTracking.activityId);
                if (activity) {
                  startTracking(activity.equipmentId, activity.fieldId);
                }
              }
            }}
          >
            <Play size={14} />
            <span>Resume</span>
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm"
          className="gap-1"
          onClick={stopTracking}
        >
          <StopCircle size={14} />
          <span>Stop</span>
        </Button>
      </div>
    </div>
  );
};

export default MapControls;
