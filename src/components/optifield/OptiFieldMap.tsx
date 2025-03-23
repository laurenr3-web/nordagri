
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Layers,
  MapPin,
  Navigation,
  Maximize,
  Minimize,
  Tractor
} from 'lucide-react';
import MapPlaceholder from './MapPlaceholder';
import { toast } from 'sonner';

interface OptiFieldMapProps {
  trackingActive: boolean;
}

const OptiFieldMap: React.FC<OptiFieldMapProps> = ({ trackingActive }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapApiKey] = useState<string>('AIzaSyDYNpssW98FUa34qBKCD6JdI7iWYnzFxyI');
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Store the API key in localStorage for persistence
    localStorage.setItem('gmaps_api_key', mapApiKey);

    // Initialize Google Maps
    const initMap = () => {
      if (window.google && mapContainerRef.current) {
        // Create map instance
        const mapOptions = {
          center: { lat: 48.8566, lng: 2.3522 }, // Paris coordinates as default
          zoom: 12,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          fullscreenControl: false, // We have our own fullscreen control
        };
        
        const map = new window.google.maps.Map(
          mapContainerRef.current,
          mapOptions
        );
        
        // You can add more map initialization code here
        // such as markers, polygons, etc.
      }
    };

    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapApiKey}&libraries=places,drawing&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      // Define the callback function
      window.initGoogleMaps = initMap;
    } else {
      // If Google Maps API is already loaded
      initMap();
    }

    return () => {
      // Cleanup if needed
      delete window.initGoogleMaps;
    };
  }, [mapApiKey]);

  return (
    <Card className={`overflow-hidden relative ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[70vh]'}`}>
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
        >
          <MapPin className="h-4 w-4" />
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

      {selectedMachines.length > 0 && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
            <div className="text-sm font-medium mb-1">Machines sélectionnées</div>
            <div className="flex flex-col gap-1">
              {selectedMachines.map(machine => (
                <div key={machine} className="flex items-center gap-2 text-xs">
                  <Tractor className="h-3 w-3" />
                  <span>{machine}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={mapContainerRef} className="h-full w-full">
        {!window.google && <MapPlaceholder trackingActive={trackingActive} />}
      </div>
    </Card>
  );
};

// Add type definition for window object to include Google Maps
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export default OptiFieldMap;

