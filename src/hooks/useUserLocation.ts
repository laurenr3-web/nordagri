
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

type LocationHookReturnType = {
  userLocation: google.maps.LatLngLiteral | null;
  isLocating: boolean;
  enableLocationTracking: () => void;
  startWatchingPosition: () => number | null;
  clearWatchPosition: () => void;
};

export const useUserLocation = (
  mapInstance: google.maps.Map | null,
  trackingActive: boolean
): LocationHookReturnType => {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  // Clean up location resources
  const cleanupLocationResources = () => {
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }
    
    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }
  };

  // Function to enable location tracking
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
        if (mapInstance) {
          mapInstance.setCenter(location);
          mapInstance.setZoom(15);
        }
        
        // Create or update user marker
        if (!userMarkerRef.current && mapInstance && window.google) {
          userMarkerRef.current = new window.google.maps.Marker({
            position: location,
            map: mapInstance,
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
            map: mapInstance,
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
  
  // Start watching user position
  const startWatchingPosition = () => {
    if (!navigator.geolocation) return null;
    
    // Clear any existing watch
    clearWatchPosition();
    
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
        if (mapInstance && trackingActive) {
          mapInstance.panTo(location);
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

  // Clear watch position
  const clearWatchPosition = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Effect for tracking user position when tracking mode changes
  useEffect(() => {
    if (trackingActive && userLocation) {
      startWatchingPosition();
      toast.success('Suivi de position activé');
    } else if (!trackingActive) {
      clearWatchPosition();
    }
    
    return () => {
      clearWatchPosition();
      cleanupLocationResources();
    };
  }, [trackingActive, userLocation, mapInstance]);

  return {
    userLocation,
    isLocating,
    enableLocationTracking,
    startWatchingPosition,
    clearWatchPosition
  };
};
