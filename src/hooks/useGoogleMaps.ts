
import { useState, useEffect, useRef, useCallback } from 'react';
import { useMapService } from '@/services/optiField/mapService';
import { toast } from 'sonner';

// Define the types for our hook
type UseGoogleMapsReturnType = {
  isLoaded: boolean;
  isLoading: boolean;
  mapRef: React.RefObject<HTMLDivElement>;
  mapInstance: google.maps.Map | null;
  error: Error | null;
  initMap: (center?: google.maps.LatLngLiteral) => void;
};

export const useGoogleMaps = (): UseGoogleMapsReturnType => {
  const { mapApiKey, isError } = useMapService();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const mapInitializedRef = useRef<boolean>(false);
  const scriptId = 'google-maps-script';
  const callbackName = 'initGoogleMapsCallback';

  // Function to load the Google Maps script
  const loadGoogleMapsScript = useCallback(() => {
    if (!mapApiKey) {
      console.error('No Google Maps API key provided');
      setError(new Error('Google Maps API key is missing'));
      toast.error('Clé API Google Maps manquante');
      return false;
    }

    // Skip if already loaded or loading
    if (window.google?.maps || document.getElementById(scriptId) || isLoading) {
      return true;
    }

    setIsLoading(true);
    console.log('Loading Google Maps script with key:', mapApiKey.substring(0, 8) + '...');

    // Set up the callback function
    window[callbackName] = () => {
      console.log('Google Maps script loaded successfully');
      setIsLoaded(true);
      setIsLoading(false);
    };

    try {
      // Create and append the script
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapApiKey}&libraries=places,drawing&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      script.onerror = (e) => {
        const err = new Error('Failed to load Google Maps API');
        console.error('Error loading Google Maps script:', e);
        setError(err);
        setIsLoading(false);
        toast.error('Erreur lors du chargement de l\'API Google Maps');
      };
      
      document.head.appendChild(script);
      scriptRef.current = script;
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error loading Google Maps API');
      setError(error);
      setIsLoading(false);
      console.error('Error creating script element:', error);
      toast.error('Erreur lors du chargement de l\'API Google Maps');
      return false;
    }
  }, [mapApiKey, isLoading]);

  // Function to initialize the map
  const initMap = useCallback((center: google.maps.LatLngLiteral = { lat: 48.8566, lng: 2.3522 }) => {
    if (!window.google?.maps) {
      console.log('Google Maps not loaded yet, attempting to load script');
      const scriptLoaded = loadGoogleMapsScript();
      if (!scriptLoaded) return;
    }
    
    if (!window.google?.maps) {
      console.error('Google Maps API still not available after loading attempt');
      return;
    }
    
    if (!mapRef.current) {
      console.error('Map container reference is not available');
      return;
    }
    
    if (mapInitializedRef.current) {
      console.log('Map already initialized, skipping');
      return;
    }
    
    try {
      console.log('Initializing map with center:', center);
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
      
      console.log('Map initialized successfully');
      setMapInstance(map);
      mapInitializedRef.current = true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error initializing map');
      setError(error);
      console.error('Error initializing map:', error);
      toast.error('Erreur lors de l\'initialisation de la carte');
    }
  }, [loadGoogleMapsScript]);

  // Load Google Maps API when the component mounts
  useEffect(() => {
    if (window.google?.maps) {
      console.log('Google Maps API already loaded');
      setIsLoaded(true);
      return;
    }
    
    if (isError) {
      console.error('Map service reported an error, not loading Google Maps');
      return;
    }
    
    console.log('Attempting to load Google Maps on component mount');
    loadGoogleMapsScript();

    // Cleanup function
    return () => {
      // Remove the callback
      if (window[callbackName]) {
        window[callbackName] = undefined;
      }
      
      // Reset map instance
      if (mapInstance) {
        console.log('Cleaning up map instance');
        setMapInstance(null);
      }
      
      // Reset initialization state
      mapInitializedRef.current = false;
      
      // We don't remove the script element to avoid issues with concurrent React components
      // using the same API, but we do clean up our reference to it
      scriptRef.current = null;
    };
  }, [loadGoogleMapsScript, mapInstance, isError]);

  return {
    isLoaded,
    isLoading,
    mapRef,
    mapInstance,
    error,
    initMap
  };
};
