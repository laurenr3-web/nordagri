import React, { useEffect, useRef } from 'react';
import { Activity } from '@/hooks/timetracking/useTimeTracking';
import { useToast } from '@/hooks/use-toast';

// Type definitions moved to src/types/google-maps.d.ts

interface GoogleMapWrapperProps {
  activities: Activity[];
  children?: React.ReactNode;
}

const GoogleMapWrapper: React.FC<GoogleMapWrapperProps> = ({ activities, children }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const { toast } = useToast();

  // Load the Google Maps API dynamically
  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      // Detect if Google Maps API is already loaded
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Otherwise load it with the provided API key
      window.initMap = initializeMap;
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDYNpssW98FUa34qBKCD6JdI7iWYnzFxyI&callback=initMap';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      return () => {
        window.initMap = null;
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    };

    // Add initMap to the window object
    window.initMap = initializeMap;

    const handleMapError = () => {
      if (mapContainerRef.current) {
        // Show placeholder if map fails to load
        mapContainerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full bg-secondary/50 rounded-lg p-6">
            <div class="text-center">
              <h3 class="text-lg font-medium mb-2">Map Loading Error</h3>
              <p class="text-muted-foreground">The map could not be loaded. Please check your connection or API key.</p>
            </div>
          </div>
        `;
      }
    };

    // In a real implementation, load the actual Google Maps API
    // For now, create a placeholder map
    setTimeout(() => {
      if (!mapRef.current && mapContainerRef.current) {
        mapContainerRef.current.innerHTML = `
          <div class="w-full h-full bg-secondary/20 rounded-lg overflow-hidden relative">
            <div class="absolute inset-0 bg-[url('/placeholder-map.jpg')] bg-cover bg-center opacity-90"></div>
            <div class="absolute bottom-4 right-4 z-10">
              <div class="bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                <div class="text-xs text-muted-foreground mb-1">Active Equipment</div>
                <div class="flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full bg-green-500"></div>
                  <span class="text-sm font-medium">John Deere 8R 410</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    }, 500);

    // In a real implementation this would initialize the actual Google Maps
    function initializeMap() {
      if (!mapContainerRef.current) return;
      
      try {
        if (window.google && window.google.maps) {
          // Initialize with real Google Maps
          const mapOptions = {
            center: { lat: 48.864716, lng: 2.349014 }, // Default to Paris
            zoom: 12,
            mapTypeId: window.google.maps.MapTypeId.SATELLITE,
            mapTypeControl: true,
            fullscreenControl: true,
            streetViewControl: false
          };
          
          mapRef.current = new window.google.maps.Map(mapContainerRef.current, mapOptions);
          
          // Add markers for each activity
          activities.forEach(activity => {
            if (activity.coordinates) {
              const marker = new window.google.maps.Marker({
                position: activity.coordinates,
                map: mapRef.current,
                title: activity.equipment,
                icon: {
                  url: activity.status === 'active' ? 'path/to/active-icon.png' : 'path/to/inactive-icon.png',
                  scaledSize: new window.google.maps.Size(32, 32)
                }
              });
              markersRef.current.push(marker);
            }
          });
        } else {
          handleMapError();
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        handleMapError();
      }
    }

    loadGoogleMapsAPI();

    return () => {
      // Cleanup
      markersRef.current = [];
      mapRef.current = null;
    };
  }, [activities]);

  return (
    <div className="relative w-full h-[70vh] rounded-lg bg-secondary/50 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
      {children}
    </div>
  );
};

export default GoogleMapWrapper;
