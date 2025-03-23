
import React from 'react';
import { Activity, ActiveTracking, Equipment } from '@/hooks/timetracking/useTimeTracking';
import ActivityList from './ActivityList';
import MapView from './MapView';
import AddActivityDialog from './AddActivityDialog';

interface TimeTrackingContentProps {
  activities: Activity[];
  activeTracking: ActiveTracking | null;
  isMapViewActive: boolean;
  startTracking: (equipmentId: number, fieldId: number) => void;
  pauseTracking: () => void;
  stopTracking: () => void;
  equipments: Equipment[];
  isAddActivityDialogOpen: boolean;
  setIsAddActivityDialogOpen: (isOpen: boolean) => void;
  onAddActivity: (activity: Omit<Activity, 'id' | 'status' | 'createdAt'>) => void;
}

const TimeTrackingContent: React.FC<TimeTrackingContentProps> = ({
  activities,
  activeTracking,
  isMapViewActive,
  startTracking,
  pauseTracking,
  stopTracking,
  equipments,
  isAddActivityDialogOpen,
  setIsAddActivityDialogOpen,
  onAddActivity
}) => {
  return (
    <div>
      {isMapViewActive ? (
        <MapView 
          activities={activities}
          activeTracking={activeTracking}
          startTracking={startTracking}
          pauseTracking={pauseTracking}
          stopTracking={stopTracking}
        />
      ) : (
        <ActivityList 
          activities={activities}
          activeTracking={activeTracking}
          startTracking={startTracking}
          pauseTracking={pauseTracking}
          stopTracking={stopTracking}
        />
      )}
      
      <AddActivityDialog 
        open={isAddActivityDialogOpen}
        onOpenChange={setIsAddActivityDialogOpen}
        equipments={equipments}
        onAddActivity={onAddActivity}
      />
    </div>
  );
};

export default TimeTrackingContent;
