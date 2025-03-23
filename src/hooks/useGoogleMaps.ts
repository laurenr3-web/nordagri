
import { useState, useEffect, useRef } from 'react';
import { useMapService } from '@/services/optiField/mapService';
import { toast } from 'sonner';

// Define the types for our hook
type UseGoogleMapsReturnType = {
  isLoaded: boolean;
  mapRef: React.RefObject<HTMLDivElement>;
  mapInstance: google.maps.Map | null;
  initMap: (center?: google.maps.LatLngLiteral) => void;
};

export const useGoogleMaps = (): UseGoogleMapsReturnType => {
  const { mapApiKey } = useMapService();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const scriptId = 'google-maps-script';
  const callbackName = 'initGoogleMapsCallback';
  const mapInitializedRef = useRef<boolean>(false);

  // Function to initialize the map
  const initMap = (center: google.maps.LatLngLiteral = { lat: 48.8566, lng: 2.3522 }) => {
    if (!window.google || !mapRef.current || mapInitializedRef.current) return;
    
    try {
      // Create map instance
      const mapOptions = {
        center,
        zoom: 12,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        fullscreenControl: false,
      };
      
      const map = new window.google.maps.Map(
        mapRef.current,
        mapOptions
      );
      
      setMapInstance(map);
      mapInitializedRef.current = true;
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Erreur lors de l\'initialisation de la carte');
    }
  };

  // Load Google Maps API
  useEffect(() => {
    // Skip if already loaded or no API key
    if (window.google || !mapApiKey || document.getElementById(scriptId)) {
      if (window.google) {
        setIsLoaded(true);
      }
      return;
    }

    // Create a global callback function
    window[callbackName] = () => {
      setIsLoaded(true);
    };

    // Create and append the script
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapApiKey}&libraries=places,drawing&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Clean up by removing the global callback
      if (window[callbackName]) {
        window[callbackName] = () => {};
      }
      
      // Reset initialization state
      mapInitializedRef.current = false;
    };
  }, [mapApiKey]);

  return {
    isLoaded,
    mapRef,
    mapInstance,
    initMap
  };
};
