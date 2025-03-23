
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Layers,
  MapPin,
  Navigation,
  Maximize,
  Minimize,
  Tractor,
  Compass
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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

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

  const enableLocationTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non supportée par votre navigateur');
      return;
    }

    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setUserLocation(location);
        
        // Center map on user location
        if (mapRef.current) {
          mapRef.current.setCenter(location);
          mapRef.current.setZoom(15);
        }
        
        // Create or update user marker
        if (!userMarkerRef.current && mapRef.current) {
          userMarkerRef.current = new google.maps.Marker({
            position: location,
            map: mapRef.current,
            title: 'Votre position',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              scale: 8,
            },
          });
          
          // Add circle around user position to indicate accuracy
          new google.maps.Circle({
            map: mapRef.current,
            center: location,
            radius: 100, // in meters
            fillColor: '#4285F4',
            fillOpacity: 0.15,
            strokeColor: '#4285F4',
            strokeOpacity: 0.3,
            strokeWeight: 1,
          });
        } else if (userMarkerRef.current) {
          userMarkerRef.current.setPosition(location);
        }
        
        toast.success('Position localisée avec succès');
        
        // Start watching position if tracking is active
        if (trackingActive) {
          startWatchingPosition();
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('L\'utilisateur a refusé la demande de géolocalisation');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Informations de localisation non disponibles');
            break;
          case error.TIMEOUT:
            toast.error('La demande de localisation a expiré');
            break;
          default:
            toast.error('Une erreur inconnue est survenue');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  const startWatchingPosition = () => {
    if (!navigator.geolocation) return;
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setUserLocation(location);
        
        // Update user marker position
        if (userMarkerRef.current) {
          userMarkerRef.current.setPosition(location);
        }
        
        // Center map on user location if tracking is active
        if (mapRef.current && trackingActive) {
          mapRef.current.panTo(location);
        }
      },
      (error) => {
        console.error('Error watching position:', error);
        toast.error('Erreur lors du suivi de position');
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    
    // Store the watch ID for cleanup
    return watchId;
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
        
        // Store map reference
        mapRef.current = map;
        
        // If we already have the user's location, center the map there
        if (userLocation) {
          map.setCenter(userLocation);
          map.setZoom(15);
          
          // Create user marker
          userMarkerRef.current = new google.maps.Marker({
            position: userLocation,
            map: map,
            title: 'Votre position',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              scale: 8,
            },
          });
        }
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
  }, [mapApiKey, userLocation]);
  
  // Effect for tracking user position when tracking mode changes
  useEffect(() => {
    let watchId: number | null = null;
    
    if (trackingActive && userLocation) {
      watchId = startWatchingPosition();
      toast.success('Suivi de position activé');
    }
    
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [trackingActive]);

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
          onClick={enableLocationTracking}
          disabled={isLocating}
        >
          <MapPin className={`h-4 w-4 ${userLocation ? 'text-primary' : ''}`} />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="bg-white/80 backdrop-blur-sm"
          onClick={() => {
            if (userLocation && mapRef.current) {
              mapRef.current.panTo(userLocation);
              mapRef.current.setZoom(15);
            } else {
              toast.info('Activez d\'abord la localisation');
            }
          }}
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
      
      {userLocation && (
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
      )}
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
