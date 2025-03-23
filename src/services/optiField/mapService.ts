
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useMapService = () => {
  const [mapApiKey, setMapApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const localStorageKey = 'gmaps_api_key';

  // Initialize
  useEffect(() => {
    // Try to get API key from localStorage
    try {
      const savedApiKey = localStorage.getItem(localStorageKey);
      
      if (savedApiKey && savedApiKey.trim() !== '') {
        console.log('Using saved API key from localStorage');
        setMapApiKey(savedApiKey);
        setIsError(false);
      } else {
        // Set default API key - consider moving this to an environment variable in production
        const defaultApiKey = 'AIzaSyDYNpssW98FUa34qBKCD6JdI7iWYnzFxyI';
        
        // Ensure we have a valid key
        if (defaultApiKey && defaultApiKey.trim() !== '') {
          console.log('Using default API key');
          setMapApiKey(defaultApiKey);
          localStorage.setItem(localStorageKey, defaultApiKey);
          setIsError(false);
        } else {
          console.error('Clé API Google Maps non définie');
          setIsError(true);
        }
      }
    } catch (error) {
      console.error('Error initializing map service:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set map API key
  const setAndSaveMapApiKey = (key: string) => {
    try {
      if (!key || key.trim() === '') {
        console.error('La clé API ne peut pas être vide');
        setIsError(true);
        toast.error('La clé API ne peut pas être vide');
        return;
      }
      
      console.log('Saving new API key to localStorage:', key.substring(0, 8) + '...');
      localStorage.setItem(localStorageKey, key);
      setMapApiKey(key);
      setIsError(false);
      toast.success('Clé API Google Maps mise à jour');
    } catch (error) {
      console.error('Error saving map API key:', error);
      setIsError(true);
      toast.error('Erreur lors de la sauvegarde de la clé API');
    }
  };

  // Check if API key is valid (basic format check)
  const isApiKeyValid = (key: string): boolean => {
    // Simple validation: key should be at least 20 chars and start with "AIza"
    return key && key.trim().length >= 20 && key.startsWith('AIza');
  };

  return {
    mapApiKey,
    isLoading,
    isError,
    setAndSaveMapApiKey,
    isApiKeyValid
  };
};
