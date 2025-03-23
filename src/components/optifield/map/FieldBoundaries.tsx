
import React, { useEffect, useState } from 'react';

interface FieldBoundary {
  id: string;
  path: Array<{lat: number; lng: number}>;
}

interface FieldBoundariesProps {
  mapInstance: google.maps.Map | null;
}

const FieldBoundaries: React.FC<FieldBoundariesProps> = ({ mapInstance }) => {
  const [fieldBoundaries, setFieldBoundaries] = useState<FieldBoundary[]>([]);
  const [polygons, setPolygons] = useState<google.maps.Polygon[]>([]);

  useEffect(() => {
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

    setFieldBoundaries(initialFieldBoundaries);
  }, []);

  // Draw field boundaries on the map
  useEffect(() => {
    if (!mapInstance || !window.google || fieldBoundaries.length === 0) return;

    // Clear previous polygons
    polygons.forEach(polygon => polygon.setMap(null));
    
    // Create new polygons
    const newPolygons: google.maps.Polygon[] = [];
    
    fieldBoundaries.forEach((field) => {
      const fieldPolygon = new window.google.maps.Polygon({
        paths: field.path,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: mapInstance,
      });
      newPolygons.push(fieldPolygon);
    });

    setPolygons(newPolygons);

    // Cleanup function
    return () => {
      newPolygons.forEach(polygon => polygon.setMap(null));
    };
  }, [mapInstance, fieldBoundaries]);

  return null; // This is a non-visual component
};

export default FieldBoundaries;
