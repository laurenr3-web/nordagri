
import React, { useState } from 'react';
import { Activity, ActiveTracking, Equipment } from '@/hooks/timetracking/useTimeTracking';
import ActivityList from './ActivityList';
import MapView from './MapView';
import AddActivityDialog from './AddActivityDialog';
import ActivityDetailsDialog from './ActivityDetailsDialog';

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
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewDetails = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDetailsOpen(true);
  };

  return (
    <div className="flex-1 p-6 pt-8">
      {isMapViewActive ? (
        <div className="h-[calc(100vh-220px)] min-h-[500px]">
          <MapView 
            activities={activities}
            activeTracking={activeTracking}
            startTracking={startTracking}
            pauseTracking={pauseTracking}
            stopTracking={stopTracking}
          />
        </div>
      ) : (
        <div className="mt-2">
          <ActivityList 
            activities={activities}
            activeTracking={activeTracking}
            startTracking={startTracking}
            pauseTracking={pauseTracking}
            stopTracking={stopTracking}
            onViewDetails={handleViewDetails}
          />
        </div>
      )}
      
      <AddActivityDialog 
        open={isAddActivityDialogOpen}
        onOpenChange={setIsAddActivityDialogOpen}
        equipments={equipments}
        onAddActivity={onAddActivity}
      />

      <ActivityDetailsDialog
        activity={selectedActivity}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
};

export default TimeTrackingContent;
