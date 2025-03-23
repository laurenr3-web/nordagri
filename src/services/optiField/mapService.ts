
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useMapService = () => {
  const [mapApiKey, setMapApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize
  useEffect(() => {
    // Try to get API key from localStorage
    try {
      const savedApiKey = localStorage.getItem('gmaps_api_key');
      if (savedApiKey) {
        setMapApiKey(savedApiKey);
      } else {
        // Set default API key - consider moving this to an environment variable in production
        const defaultApiKey = 'AIzaSyDYNpssW98FUa34qBKCD6JdI7iWYnzFxyI';
        setMapApiKey(defaultApiKey);
        localStorage.setItem('gmaps_api_key', defaultApiKey);
      }
    } catch (error) {
      console.error('Error initializing map service:', error);
      toast.error('Erreur lors de l\'initialisation du service de carte');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set map API key
  const setAndSaveMapApiKey = (key: string) => {
    try {
      setMapApiKey(key);
      localStorage.setItem('gmaps_api_key', key);
      toast.success('Clé API Google Maps mise à jour');
    } catch (error) {
      console.error('Error saving map API key:', error);
      toast.error('Erreur lors de la sauvegarde de la clé API');
    }
  };

  return {
    mapApiKey,
    isLoading,
    setAndSaveMapApiKey
  };
};
