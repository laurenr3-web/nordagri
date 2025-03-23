
import { useState, useEffect } from 'react';
import { Activity, ActiveTracking, Equipment } from './types';
import { getMockEquipments, getInitialActivities } from './mockData';
import { useActivityUtils } from './activityUtils';

export type { Activity, ActiveTracking, Equipment };

export const useTimeTracking = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTracking, setActiveTracking] = useState<ActiveTracking | null>(null);
  const [isAddActivityDialogOpen, setIsAddActivityDialogOpen] = useState(false);
  const [isMapViewActive, setIsMapViewActive] = useState(false);
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null);

  const { startTracking: startTrackingUtil, pauseTracking: pauseTrackingUtil, 
         stopTracking: stopTrackingUtil, addActivity: addActivityUtil } = useActivityUtils();

  // Initialize mock data
  useEffect(() => {
    setActivities(getInitialActivities());
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, [trackingInterval]);

  // Wrapper functions that provide the required state
  const startTracking = (equipmentId: number, fieldId: number) => {
    startTrackingUtil(
      activities, 
      setActivities, 
      activeTracking, 
      setActiveTracking, 
      trackingInterval, 
      setTrackingInterval, 
      equipmentId, 
      fieldId
    );
  };

  const pauseTracking = () => {
    pauseTrackingUtil(
      activities, 
      setActivities, 
      activeTracking, 
      setActiveTracking, 
      trackingInterval, 
      setTrackingInterval
    );
  };

  const stopTracking = () => {
    stopTrackingUtil(
      activities, 
      setActivities, 
      activeTracking, 
      setActiveTracking, 
      trackingInterval, 
      setTrackingInterval
    );
  };

  const addActivity = (newActivity: Omit<Activity, 'id' | 'status' | 'createdAt'>) => {
    addActivityUtil(activities, setActivities, newActivity);
  };

  // Equipments from mock data
  const equipments: Equipment[] = getMockEquipments();

  return {
    activities,
    activeTracking,
    equipments,
    isAddActivityDialogOpen,
    setIsAddActivityDialogOpen,
    isMapViewActive,
    setIsMapViewActive,
    startTracking,
    pauseTracking,
    stopTracking,
    addActivity
  };
};
