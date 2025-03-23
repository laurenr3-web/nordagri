
import { useState, useEffect } from 'react';

export const useMapService = () => {
  const [mapApiKey, setMapApiKey] = useState<string>('');

  // Initialize
  useEffect(() => {
    // Try to get API key from localStorage
    const savedApiKey = localStorage.getItem('gmaps_api_key');
    if (savedApiKey) {
      setMapApiKey(savedApiKey);
    }
  }, []);

  // Set map API key
  const setAndSaveMapApiKey = (key: string) => {
    setMapApiKey(key);
    localStorage.setItem('gmaps_api_key', key);
  };

  return {
    mapApiKey,
    setAndSaveMapApiKey
  };
};
