
import { useState, useEffect } from 'react';
import { testOpenAIConnection, checkApiKey } from '@/services/openai/client';

export const useOpenAIStatus = () => {
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      setError(null);
      
      // Vérifier si la clé API existe
      const hasApiKey = checkApiKey();
      setIsApiKeyValid(hasApiKey);
      
      if (hasApiKey) {
        try {
          // Tester la connexion API
          const connected = await testOpenAIConnection();
          setIsConnected(connected);
          
          if (!connected) {
            setError("Impossible de se connecter à l'API OpenAI");
          }
        } catch (err) {
          setIsConnected(false);
          setError(err instanceof Error ? err.message : "Erreur inconnue");
        }
      } else {
        setIsConnected(false);
        setError("Clé API OpenAI manquante");
      }
      
      setIsLoading(false);
    };
    
    checkConnection();
  }, []);

  return {
    isApiKeyValid,
    isConnected,
    isLoading,
    error,
    checkConnection: async () => {
      setIsLoading(true);
      const connected = await testOpenAIConnection();
      setIsConnected(connected);
      setIsLoading(false);
      return connected;
    }
  };
};

// Exporter le hook
export default useOpenAIStatus;
