import React, { useEffect, useRef } from 'react';
import { Activity, ActiveTracking } from '@/hooks/timetracking/useTimeTracking';
import { Button } from '@/components/ui/button';
import { Play, Pause, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MapViewProps {
  activities: Activity[];
  activeTracking: ActiveTracking | null;
  startTracking: (equipmentId: number, fieldId: number) => void;
  pauseTracking: () => void;
  stopTracking: () => void;
}

const MapView: React.FC<MapViewProps> = ({
  activities,
  activeTracking,
  startTracking,
  pauseTracking,
  stopTracking
}) => {
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

      // Otherwise load it
      // In a real implementation, this would use your Google Maps API key
      window.initMap = initializeMap;
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      // Show a temporary toast for the demo
      toast({
        title: "Map Integration",
        description: "In a production environment, this would use your Google Maps API key.",
      });

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

        // Add mock controls
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg';
        controlsDiv.innerHTML = `
          <div class="flex gap-2">
            ${activeTracking ? `
              ${activeTracking.status === 'active' ? `
                <button id="pause-tracking" class="text-xs flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                  Pause
                </button>
              ` : `
                <button id="resume-tracking" class="text-xs flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  Resume
                </button>
              `}
              <button id="stop-tracking" class="text-xs flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><rect x="9" y="9" width="6" height="6"></rect></svg>
                Stop
              </button>
            ` : `
              <button id="start-tracking" class="text-xs flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Start Tracking
              </button>
            `}
          </div>
        `;
        
        mapContainerRef.current.appendChild(controlsDiv);
        
        // Add event listeners to mock buttons
        const pauseBtn = document.getElementById('pause-tracking');
        const resumeBtn = document.getElementById('resume-tracking');
        const stopBtn = document.getElementById('stop-tracking');
        const startBtn = document.getElementById('start-tracking');
        
        if (pauseBtn) pauseBtn.addEventListener('click', pauseTracking);
        if (resumeBtn && activities.length > 0) resumeBtn.addEventListener('click', () => {
          const activity = activities[0];
          startTracking(activity.equipmentId, activity.fieldId);
        });
        if (stopBtn) stopBtn.addEventListener('click', stopTracking);
        if (startBtn && activities.length > 0) startBtn.addEventListener('click', () => {
          const activity = activities[0];
          startTracking(activity.equipmentId, activity.fieldId);
        });
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
  }, [activities, activeTracking]);

  return (
    <div className="relative w-full h-[70vh] rounded-lg bg-secondary/50 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Map Controls - Visible when Google Maps is loaded */}
      {mapRef.current && activeTracking && (
        <div className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
          <div className="flex gap-2">
            {activeTracking.status === 'active' ? (
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1"
                onClick={pauseTracking}
              >
                <Pause size={14} />
                <span>Pause</span>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1"
                onClick={() => {
                  if (activities.length > 0) {
                    const activity = activities.find(a => a.id === activeTracking.activityId);
                    if (activity) {
                      startTracking(activity.equipmentId, activity.fieldId);
                    }
                  }
                }}
              >
                <Play size={14} />
                <span>Resume</span>
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1"
              onClick={stopTracking}
            >
              <StopCircle size={14} />
              <span>Stop</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Add type definition for initMap callback
declare global {
  interface Window {
    initMap: () => void;
    google?: any;
  }
}

export default MapView;
