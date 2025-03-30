
import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour débouncer une valeur
 * @param value Valeur à débouncer
 * @param delay Délai en millisecondes
 * @returns Valeur débouncée
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    // Créer un timer qui met à jour la valeur débouncée après le délai spécifié
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Nettoyer le timer si la valeur change avant la fin du délai
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}
