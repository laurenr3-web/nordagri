
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
import { useMapService } from '@/services/optiField/mapService';

interface OptiFieldMapProps {
  trackingActive: boolean;
}

const OptiFieldMap: React.FC<OptiFieldMapProps> = ({ trackingActive }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const { mapApiKey } = useMapService();
  
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
    toast.success(`Machine sélectionnée: ${machineName}`);
    setSelectedMachines(prev => 
      prev.includes(machineName) 
        ? prev.filter(name => name !== machineName) 
        : [...prev, machineName]
    );
  };

  // Initialize map when Google Maps API is loaded
  useEffect(() => {
    if (isLoaded && !mapInstance && mapApiKey) {
      initMap();
    }
  }, [isLoaded, mapInstance, initMap, mapApiKey]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error("Erreur dans le chargement de la carte");
    }
  }, [error]);

  return (
    <Card className={`overflow-hidden relative rounded-xl shadow-md ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[75vh]'}`}>
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
      <div ref={mapRef} className="h-full w-full bg-sidebar-accent/30">
        {isLoading && (
          <div className="h-full w-full flex items-center justify-center bg-sidebar-accent/20">
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
      
      {/* Map Status Indicator */}
      {isLoaded && (
        <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-sidebar/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium shadow-sm z-10 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${trackingActive ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
          <span>{trackingActive ? 'Suivi actif' : 'Prêt'}</span>
        </div>
      )}
    </Card>
  );
};

export default OptiFieldMap;
