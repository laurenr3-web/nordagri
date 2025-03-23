
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
import { useMapService } from '@/services/optiField/mapService';

// Google Maps API proper TypeScript declarations
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

interface OptiFieldMapProps {
  trackingActive: boolean;
}

interface FieldBoundary {
  id: string;
  path: Array<{lat: number; lng: number}>;
}

const OptiFieldMap: React.FC<OptiFieldMapProps> = ({ trackingActive }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { mapApiKey } = useMapService();
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [fieldBoundaries, setFieldBoundaries] = useState<FieldBoundary[]>([]);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const mapInitializedRef = useRef<boolean>(false);
  const circleRef = useRef<any>(null);

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
        if (!userMarkerRef.current && mapRef.current && window.google) {
          userMarkerRef.current = new window.google.maps.Marker({
            position: location,
            map: mapRef.current,
            title: 'Votre position',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              scale: 8,
            },
          });
          
          // Add circle around user position to indicate accuracy
          if (circleRef.current) {
            circleRef.current.setMap(null);
          }
          
          circleRef.current = new window.google.maps.Circle({
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
          
          if (circleRef.current) {
            circleRef.current.setCenter(location);
          }
        }
        
        toast.success('Position localisée avec succès');
        
        // Start watching position if tracking is active
        if (trackingActive) {
          startWatchingPosition();
        }
        
        setIsLocating(false);
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
    if (!navigator.geolocation) return null;
    
    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setUserLocation(location);
        
        // Update user marker position
        if (userMarkerRef.current) {
          userMarkerRef.current.setPosition(location);
          
          if (circleRef.current) {
            circleRef.current.setCenter(location);
          }
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
    watchIdRef.current = watchId;
    return watchId;
  };

  // Initialize Google Maps
  const initMap = () => {
    if (!window.google || !mapContainerRef.current || mapInitializedRef.current) return;
    
    try {
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
      mapInitializedRef.current = true;
      
      // If we already have the user's location, center the map there
      if (userLocation) {
        map.setCenter(userLocation);
        map.setZoom(15);
        
        // Create user marker
        userMarkerRef.current = new window.google.maps.Marker({
          position: userLocation,
          map: map,
          title: 'Votre position',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 8,
          },
        });
      }

      // Define field boundaries (replace with your actual data)
      const initialFieldBoundaries = [
        {
          id: 'field1',
          path: [
            { lat: 48.86472, lng: 2.34583 },
            { lat: 48.86694, lng: 2.34861 },
            { lat: 48.86583, lng: 2.35056 },
            { lat: 48.86361, lng: 2.34778 },
          ],
        },
        {
          id: 'field2',
          path: [
            { lat: 48.85772, lng: 2.34383 },
            { lat: 48.85994, lng: 2.34661 },
            { lat: 48.85883, lng: 2.34856 },
            { lat: 48.85661, lng: 2.34578 },
          ],
        },
      ];

      // Draw field boundaries on the map
      const polygons: any[] = [];
      initialFieldBoundaries.forEach((field) => {
        const fieldPolygon = new window.google.maps.Polygon({
          paths: field.path,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          map: map,
        });
        polygons.push(fieldPolygon);
      });

      setFieldBoundaries(initialFieldBoundaries);
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Erreur lors de l\'initialisation de la carte');
    }
  };

  // Load Google Maps API
  useEffect(() => {
    // Define the callback function
    window.initGoogleMaps = initMap;

    // Only load the script if it doesn't exist and we have an API key
    if (!window.google && mapApiKey && !document.getElementById('google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapApiKey}&libraries=places,drawing&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      // Store script reference for cleanup
      scriptRef.current = script;
    } else if (window.google) {
      // If Google Maps API is already loaded
      initMap();
    }

    return () => {
      // Cleanup function to prevent "removeChild" error
      // Make sure to clear Google Maps resources
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      
      // Clear any existing geolocation watch
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      // Don't remove the script in the cleanup function
      // This prevents the "removeChild" DOM error
      
      // Instead, just reset initialization state
      mapInitializedRef.current = false;
      
      // Remove the callback, but only if component is unmounting
      if (window.initGoogleMaps === initMap) {
        window.initGoogleMaps = () => {}; // Replace with no-op
      }
    };
  }, [mapApiKey]);
  
  // Effect for tracking user position when tracking mode changes
  useEffect(() => {
    if (trackingActive && userLocation) {
      startWatchingPosition();
      toast.success('Suivi de position activé');
    } else if (!trackingActive && watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [trackingActive, userLocation]);

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

export default OptiFieldMap;
