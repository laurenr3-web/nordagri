
import { useState, useEffect } from 'react';
import { 
  Equipment, 
  Field, 
  TrackingSession, 
  ActivitySummary, 
  FieldPosition 
} from '@/types/OptiField';
import { 
  mockEquipment, 
  mockFields, 
  mockTrackingSessions, 
  generateActivitySummaries 
} from '@/data/optiFieldData';
import { toast } from 'sonner';

export const useOptiField = () => {
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
  const [fields, setFields] = useState<Field[]>(mockFields);
  const [trackingSessions, setTrackingSessions] = useState<TrackingSession[]>(mockTrackingSessions);
  const [activitySummaries, setActivitySummaries] = useState<ActivitySummary[]>(generateActivitySummaries());
  const [activeSession, setActiveSession] = useState<TrackingSession | null>(
    mockTrackingSessions.find(session => session.status === 'active') || null
  );
  const [currentPosition, setCurrentPosition] = useState<FieldPosition | null>(null);
  const [mapApiKey, setMapApiKey] = useState<string>('');

  // Initialize
  useEffect(() => {
    // Try to get API key from localStorage
    const savedApiKey = localStorage.getItem('gmaps_api_key');
    if (savedApiKey) {
      setMapApiKey(savedApiKey);
    }

    // In a real app, we would also initialize geolocation here
    initializeGeolocation();
  }, []);

  // Initialize geolocation
  const initializeGeolocation = () => {
    if ('geolocation' in navigator) {
      // This would be real geolocation in a production app
      // For demo purposes, we'll just simulate position updates
      simulatePositionUpdates();
    } else {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  // Simulate position updates for demo
  const simulatePositionUpdates = () => {
    // For demo, we'll update the current position every 5 seconds
    const interval = setInterval(() => {
      if (activeSession) {
        // Generate a slight movement around the current field
        const currentField = fields.find(field => field.id === activeSession.fieldId);
        if (currentField && currentField.boundaries.length > 0) {
          const basePosition = currentField.boundaries[0];
          const newPosition = {
            lat: basePosition.lat + (Math.random() - 0.5) * 0.01,
            lng: basePosition.lng + (Math.random() - 0.5) * 0.01
          };
          
          setCurrentPosition(newPosition);
          
          // Update equipment position
          updateEquipmentPosition(newPosition);
          
          // Update session path
          updateSessionPath(activeSession.id, newPosition);
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  };

  // Start tracking session
  const startTracking = (
    equipmentId: string, 
    implementId?: string, 
    fieldId?: string,
    activityType?: string
  ) => {
    // Create a new session
    const newSession: TrackingSession = {
      id: `session${Date.now()}`,
      equipmentPairingId: `pairing${Date.now()}`,
      fieldId,
      activityType: activityType as any,
      startTime: new Date(),
      path: currentPosition ? [currentPosition] : [],
      status: 'active',
      totalDuration: 0,
      productiveTime: 0
    };
    
    setTrackingSessions(prev => [...prev, newSession]);
    setActiveSession(newSession);
    
    // Update equipment status
    setEquipment(prev => 
      prev.map(item => 
        (item.id === equipmentId || item.id === implementId) 
          ? { ...item, status: 'active', currentField: fieldId } 
          : item
      )
    );
    
    return newSession;
  };

  // Pause tracking session
  const pauseTracking = () => {
    if (activeSession) {
      const updatedSession = { ...activeSession, status: 'paused' as const };
      updateSession(updatedSession);
      setActiveSession(updatedSession);
    }
  };

  // Resume tracking session
  const resumeTracking = () => {
    if (activeSession) {
      const updatedSession = { ...activeSession, status: 'active' as const };
      updateSession(updatedSession);
      setActiveSession(updatedSession);
    }
  };

  // Stop tracking session
  const stopTracking = () => {
    if (activeSession) {
      const endTime = new Date();
      const totalDuration = Math.round(
        (endTime.getTime() - activeSession.startTime.getTime()) / (1000 * 60)
      );
      
      // Assume productive time is 90% of total time for demo
      const productiveTime = Math.round(totalDuration * 0.9);
      
      const updatedSession = { 
        ...activeSession, 
        status: 'completed' as const, 
        endTime, 
        totalDuration,
        productiveTime
      };
      
      updateSession(updatedSession);
      setActiveSession(null);
      
      // Generate a new activity summary
      const equipment = getEquipmentById(activeSession.equipmentPairingId.split('-')[0]);
      const field = getFieldById(activeSession.fieldId || '');
      
      if (equipment) {
        const newSummary: ActivitySummary = {
          equipmentName: equipment.name,
          fieldName: field?.name,
          activityType: activeSession.activityType,
          duration: totalDuration,
          date: new Date(),
          efficiency: Math.round(productiveTime / totalDuration * 100)
        };
        
        setActivitySummaries(prev => [...prev, newSummary]);
      }
    }
  };

  // Update equipment position
  const updateEquipmentPosition = (position: FieldPosition) => {
    if (activeSession) {
      const equipmentId = activeSession.equipmentPairingId.split('-')[0];
      
      setEquipment(prev => 
        prev.map(item => 
          item.id === equipmentId 
            ? { ...item, currentLocation: position } 
            : item
        )
      );
    }
  };

  // Update session path
  const updateSessionPath = (sessionId: string, position: FieldPosition) => {
    setTrackingSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, path: [...session.path, position] } 
          : session
      )
    );
    
    if (activeSession && activeSession.id === sessionId) {
      setActiveSession(prev => 
        prev ? { ...prev, path: [...prev.path, position] } : prev
      );
    }
  };

  // Update session
  const updateSession = (session: TrackingSession) => {
    setTrackingSessions(prev => 
      prev.map(item => 
        item.id === session.id ? session : item
      )
    );
  };

  // Get equipment by ID
  const getEquipmentById = (id: string): Equipment | undefined => {
    return equipment.find(item => item.id === id);
  };

  // Get field by ID
  const getFieldById = (id: string): Field | undefined => {
    return fields.find(field => field.id === id);
  };

  // Set map API key
  const setAndSaveMapApiKey = (key: string) => {
    setMapApiKey(key);
    localStorage.setItem('gmaps_api_key', key);
  };

  return {
    equipment,
    fields,
    trackingSessions,
    activitySummaries,
    activeSession,
    currentPosition,
    mapApiKey,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
    setAndSaveMapApiKey
  };
};

export default useOptiField;
