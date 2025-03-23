
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Types
export interface Activity {
  id: number;
  taskName: string;
  equipmentId: number;
  equipment: string;
  fieldId: number;
  field: string;
  fieldSize: number;
  status: 'pending' | 'active' | 'paused' | 'completed';
  duration: number;
  createdAt: Date;
  coordinates?: {
    lat: number;
    lng: number;
  };
  notes?: string;
}

export interface Equipment {
  id: number;
  name: string;
  type: string;
  status: 'available' | 'in-use' | 'maintenance';
}

export interface ActiveTracking {
  activityId: number;
  equipment: string;
  field: string;
  status: 'active' | 'paused';
  startTime: Date;
  duration: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const useTimeTracking = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTracking, setActiveTracking] = useState<ActiveTracking | null>(null);
  const [isAddActivityDialogOpen, setIsAddActivityDialogOpen] = useState(false);
  const [isMapViewActive, setIsMapViewActive] = useState(false);
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Mock equipment data
  const equipments: Equipment[] = [
    { id: 1, name: 'John Deere 8R 410', type: 'Tractor', status: 'available' },
    { id: 2, name: 'Case IH Axial-Flow', type: 'Harvester', status: 'available' },
    { id: 3, name: 'Kubota M7-172', type: 'Tractor', status: 'available' },
    { id: 4, name: 'Massey Ferguson 8S.245', type: 'Tractor', status: 'maintenance' },
    { id: 5, name: 'New Holland T6.180', type: 'Tractor', status: 'available' },
    { id: 6, name: 'Fendt 942 Vario', type: 'Tractor', status: 'in-use' },
  ];

  // Mock initial data
  useEffect(() => {
    const initialActivities: Activity[] = [
      {
        id: 1,
        taskName: 'Plowing North Field',
        equipmentId: 1,
        equipment: 'John Deere 8R 410',
        fieldId: 1,
        field: 'North Field',
        fieldSize: 25,
        status: 'pending',
        duration: 0,
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        coordinates: { lat: 48.874716, lng: 2.359014 },
        notes: 'Prepare field for spring planting'
      },
      {
        id: 2,
        taskName: 'Harvesting South Field',
        equipmentId: 2,
        equipment: 'Case IH Axial-Flow',
        fieldId: 2,
        field: 'South Field',
        fieldSize: 18,
        status: 'completed',
        duration: 5.5 * 3600, // 5.5 hours in seconds
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        coordinates: { lat: 48.854716, lng: 2.339014 },
        notes: 'Completed harvesting winter wheat'
      }
    ];

    setActivities(initialActivities);
  }, []);

  // Start tracking
  const startTracking = (equipmentId: number, fieldId: number) => {
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
  const pauseTracking = () => {
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
  const stopTracking = () => {
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
  const addActivity = (newActivity: Omit<Activity, 'id' | 'status' | 'createdAt'>) => {
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

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, [trackingInterval]);

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
