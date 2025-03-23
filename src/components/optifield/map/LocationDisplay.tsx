
import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationDisplayProps {
  userLocation: google.maps.LatLngLiteral | null;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({ userLocation }) => {
  if (!userLocation) return null;
  
  return (
    <div className="absolute bottom-4 left-4 z-10">
      <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
        <div className="text-xs flex items-center gap-1">
          <MapPin className="h-3 w-3 text-primary" />
          <span>
            {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LocationDisplay;
