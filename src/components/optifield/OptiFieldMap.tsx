
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import MapPlaceholder from './MapPlaceholder';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useUserLocation } from '@/hooks/useUserLocation';
import MapControls from './map/MapControls';
import SelectedMachines from './map/SelectedMachines';
import LocationDisplay from './map/LocationDisplay';
import FieldBoundaries from './map/FieldBoundaries';

interface OptiFieldMapProps {
  trackingActive: boolean;
}

const OptiFieldMap: React.FC<OptiFieldMapProps> = ({ trackingActive }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  
  // Initialize Google Maps
  const { isLoaded, mapRef, mapInstance, initMap } = useGoogleMaps();
  
  // Initialize user location tracking
  const { 
    userLocation, 
    isLocating, 
    enableLocationTracking 
  } = useUserLocation(mapInstance, trackingActive);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMachineSelected = (machineName: string) => {
    // For demonstration, we'll use the toast to show the selection
    toast.success(`Machine sélectionnée: ${machineName}`);
    setSelectedMachines(prev => 
      prev.includes(machineName) 
        ? prev.filter(name => name !== machineName) 
        : [...prev, machineName]
    );
  };

  // Initialize map when Google Maps API is loaded
  React.useEffect(() => {
    if (isLoaded && !mapInstance) {
      initMap();
    }
  }, [isLoaded, mapInstance, initMap]);

  return (
    <Card className={`overflow-hidden relative ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[70vh]'}`}>
      {/* Map Controls */}
      <MapControls 
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        enableLocationTracking={enableLocationTracking}
        isLocating={isLocating}
        userLocation={userLocation}
        mapInstance={mapInstance}
      />

      {/* Selected Machines */}
      <SelectedMachines selectedMachines={selectedMachines} />

      {/* Map Container */}
      <div ref={mapRef} className="h-full w-full">
        {!isLoaded && <MapPlaceholder trackingActive={trackingActive} />}
      </div>
      
      {/* Field Boundaries (non-visual component) */}
      {isLoaded && mapInstance && (
        <FieldBoundaries mapInstance={mapInstance} />
      )}
      
      {/* Location Display */}
      <LocationDisplay userLocation={userLocation} />
    </Card>
  );
};

export default OptiFieldMap;
