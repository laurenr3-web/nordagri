
import React, { useRef } from 'react';
import { Activity, ActiveTracking } from '@/hooks/timetracking/useTimeTracking';
import GoogleMapWrapper from './map/GoogleMapWrapper';
import MapControls from './map/MapControls';
import MockMap from './map/MockMap';

interface MapViewProps {
  activities: Activity[];
  activeTracking: ActiveTracking | null;
  startTracking: (equipmentId: number, fieldId: number) => void;
  pauseTracking: () => void;
  stopTracking: () => void;
}

const MapView: React.FC<MapViewProps> = ({
  activities,
  activeTracking,
  startTracking,
  pauseTracking,
  stopTracking
}) => {
  const mapRef = useRef<any>(null);
  const useRealMap = false; // Set to true to use the real Google Maps

  // For demonstration purposes, we're conditionally rendering either
  // the real map implementation or a mock version
  if (useRealMap) {
    return (
      <GoogleMapWrapper activities={activities}>
        {activeTracking && (
          <MapControls
            activeTracking={activeTracking}
            mapRef={mapRef}
            pauseTracking={pauseTracking}
            stopTracking={stopTracking}
            startTracking={startTracking}
            activities={activities}
          />
        )}
      </GoogleMapWrapper>
    );
  }
  
  // Use the mock map for development/testing
  return (
    <MockMap
      activities={activities}
      activeTracking={activeTracking}
      startTracking={startTracking}
      pauseTracking={pauseTracking}
      stopTracking={stopTracking}
    />
  );
};

export default MapView;
