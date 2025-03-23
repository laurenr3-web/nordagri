
import React from 'react';
import { Button } from '@/components/ui/button';
import { Layers, MapPin, Navigation, Maximize, Minimize, Compass } from 'lucide-react';
import { toast } from 'sonner';

interface MapControlsProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  enableLocationTracking: () => void;
  isLocating: boolean;
  userLocation: google.maps.LatLngLiteral | null;
  mapInstance: google.maps.Map | null;
}

const MapControls: React.FC<MapControlsProps> = ({ 
  isFullscreen, 
  toggleFullscreen, 
  enableLocationTracking, 
  isLocating, 
  userLocation, 
  mapInstance 
}) => {
  const centerMapOnUser = () => {
    if (userLocation && mapInstance) {
      mapInstance.panTo(userLocation);
      mapInstance.setZoom(15);
    } else {
      toast.info('Activez d\'abord la localisation');
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <Button 
        variant="secondary" 
        size="icon" 
        className="bg-white/80 backdrop-blur-sm"
      >
        <Layers className="h-4 w-4" />
      </Button>
      <Button 
        variant="secondary" 
        size="icon" 
        className="bg-white/80 backdrop-blur-sm"
        onClick={enableLocationTracking}
        disabled={isLocating}
      >
        <MapPin className={`h-4 w-4 ${userLocation ? 'text-primary' : ''}`} />
      </Button>
      <Button 
        variant="secondary" 
        size="icon" 
        className="bg-white/80 backdrop-blur-sm"
        onClick={centerMapOnUser}
        disabled={!userLocation}
      >
        <Compass className="h-4 w-4" />
      </Button>
      <Button 
        variant="secondary" 
        size="icon" 
        className="bg-white/80 backdrop-blur-sm"
      >
        <Navigation className="h-4 w-4" />
      </Button>
      <Button 
        variant="secondary" 
        size="icon" 
        className="bg-white/80 backdrop-blur-sm"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default MapControls;
