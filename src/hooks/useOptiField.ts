
import { useGeolocationService } from '@/services/optiField/geolocationService';
import { useSessionService } from '@/services/optiField/sessionService';
import { useMapService } from '@/services/optiField/mapService';

export const useOptiField = () => {
  const { currentPosition, setCurrentPosition } = useGeolocationService();
  const { 
    equipment,
    fields,
    trackingSessions,
    activitySummaries,
    activeSession,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking
  } = useSessionService(currentPosition);
  const { mapApiKey, setAndSaveMapApiKey } = useMapService();

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
