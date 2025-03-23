
import { Activity, ActiveTracking } from './types';
import { useToast } from '@/hooks/use-toast';

// Helper functions for managing activities
export const useActivityUtils = () => {
  const { toast } = useToast();

  // Start tracking an activity
  const startTracking = (
    activities: Activity[],
    setActivities: React.Dispatch<React.SetStateAction<Activity[]>>,
    activeTracking: ActiveTracking | null,
    setActiveTracking: React.Dispatch<React.SetStateAction<ActiveTracking | null>>,
    trackingInterval: NodeJS.Timeout | null,
    setTrackingInterval: React.Dispatch<React.SetStateAction<NodeJS.Timeout | null>>,
    equipmentId: number,
    fieldId: number
  ) => {
    // Find the activity
    const activity = activities.find(a => a.equipmentId === equipmentId && a.fieldId === fieldId);
    if (!activity) return;

    // Update activity status
    const updatedActivities = activities.map(a => 
      a.id === activity.id ? { ...a, status: 'active' as const } : a
    );
    setActivities(updatedActivities);

    // Create or update active tracking
    if (activeTracking && activeTracking.activityId === activity.id) {
      // Resume existing tracking
      setActiveTracking({
        ...activeTracking,
        status: 'active'
      });
    } else {
      // Start new tracking
      setActiveTracking({
        activityId: activity.id,
        equipment: activity.equipment,
        field: activity.field,
        status: 'active',
        startTime: new Date(),
        duration: activity.duration,
        coordinates: activity.coordinates
      });
    }

    // Start the timer
    if (trackingInterval) {
      clearInterval(trackingInterval);
    }

    const interval = setInterval(() => {
      setActiveTracking(prev => {
        if (!prev || prev.status !== 'active') return prev;
        return {
          ...prev,
          duration: prev.duration + 1
        };
      });

      setActivities(prev => {
        return prev.map(a => {
          if (a.id === activity.id && activeTracking?.status === 'active') {
            return {
              ...a,
              duration: a.duration + 1
            };
          }
          return a;
        });
      });
    }, 1000);

    setTrackingInterval(interval);

    toast({
      title: "Tracking Started",
      description: `Now tracking ${activity.equipment} on ${activity.field}`,
    });
  };

  // Pause tracking
  const pauseTracking = (
    activities: Activity[],
    setActivities: React.Dispatch<React.SetStateAction<Activity[]>>,
    activeTracking: ActiveTracking | null,
    setActiveTracking: React.Dispatch<React.SetStateAction<ActiveTracking | null>>,
    trackingInterval: NodeJS.Timeout | null,
    setTrackingInterval: React.Dispatch<React.SetStateAction<NodeJS.Timeout | null>>
  ) => {
    if (!activeTracking) return;

    setActiveTracking({
      ...activeTracking,
      status: 'paused'
    });

    const updatedActivities = activities.map(a => 
      a.id === activeTracking.activityId ? { ...a, status: 'paused' as const } : a
    );
    setActivities(updatedActivities);

    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }

    toast({
      title: "Tracking Paused",
      description: `Paused tracking for ${activeTracking.equipment}`,
    });
  };

  // Stop tracking
  const stopTracking = (
    activities: Activity[],
    setActivities: React.Dispatch<React.SetStateAction<Activity[]>>,
    activeTracking: ActiveTracking | null,
    setActiveTracking: React.Dispatch<React.SetStateAction<ActiveTracking | null>>,
    trackingInterval: NodeJS.Timeout | null,
    setTrackingInterval: React.Dispatch<React.SetStateAction<NodeJS.Timeout | null>>
  ) => {
    if (!activeTracking) return;

    const updatedActivities = activities.map(a => 
      a.id === activeTracking.activityId ? { ...a, status: 'completed' as const } : a
    );
    setActivities(updatedActivities);

    setActiveTracking(null);

    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }

    toast({
      title: "Tracking Completed",
      description: `Completed tracking for ${activeTracking.equipment}`,
    });
  };

  // Add new activity
  const addActivity = (
    activities: Activity[],
    setActivities: React.Dispatch<React.SetStateAction<Activity[]>>,
    newActivity: Omit<Activity, 'id' | 'status' | 'createdAt'>
  ) => {
    const activity: Activity = {
      ...newActivity,
      id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
      status: 'pending',
      createdAt: new Date()
    };

    setActivities([...activities, activity]);

    toast({
      title: "Activity Added",
      description: `Added new activity: ${activity.taskName}`,
    });
  };

  return {
    startTracking,
    pauseTracking,
    stopTracking,
    addActivity
  };
};
