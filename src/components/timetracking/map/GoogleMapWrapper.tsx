
import React, { useEffect, useRef } from 'react';
import { Activity } from '@/hooks/timetracking/useTimeTracking';

interface GoogleMapWrapperProps {
  children?: React.ReactNode;
  activities: Activity[];
}

const GoogleMapWrapper: React.FC<GoogleMapWrapperProps> = ({ children, activities }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const apiKey = 'AIzaSyDYNpssW98FUa34qBKCD6JdI7iWYnzFxyI';

  useEffect(() => {
    // Define the initMap function on the window object
    window.initMap = () => {
      if (!mapRef.current) return;
      
      const mapOptions = {
        center: { lat: 48.8566, lng: 2.3522 }, // Default to Paris
        zoom: 12,
      };
      
      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      
      // Add markers for each activity
      activities.forEach((activity) => {
        if (activity.location) {
          new window.google.maps.Marker({
            position: { lat: activity.location.lat, lng: activity.location.lng },
            map,
            title: activity.description || activity.taskName,
          });
        }
      });
      
      return map;
    };

    // Load the Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Clean up by removing the script when component unmounts
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
      // Clean up the global function
      delete window.initMap;
    };
  }, [activities]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full rounded-lg"></div>
      {children}
    </div>
  );
};

export default GoogleMapWrapper;
