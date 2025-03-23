
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import MapPlaceholder from './MapPlaceholder';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useUserLocation } from '@/hooks/useUserLocation';
import MapControls from './map/MapControls';
import SelectedMachines from './map/SelectedMachines';
import LocationDisplay from './map/LocationDisplay';
import FieldBoundaries from './map/FieldBoundaries';
import { Skeleton } from '@/components/ui/skeleton';

interface OptiFieldMapProps {
  trackingActive: boolean;
}

const OptiFieldMap: React.FC<OptiFieldMapProps> = ({ trackingActive }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  
  // Initialize Google Maps
  const { isLoaded, isLoading, mapRef, mapInstance, error, initMap } = useGoogleMaps();
  
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
  useEffect(() => {
    if (isLoaded && !mapInstance) {
      initMap();
    }
  }, [isLoaded, mapInstance, initMap]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error("Erreur dans le chargement de la carte");
    }
  }, [error]);

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
        {isLoading && (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <Skeleton className="h-full w-full" />
          </div>
        )}
        {!isLoaded && !isLoading && <MapPlaceholder trackingActive={trackingActive} />}
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
