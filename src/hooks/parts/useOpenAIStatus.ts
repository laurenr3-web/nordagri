
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
      
      try {
        // Vérifier si la clé API existe et a un format valide
        const hasApiKey = checkApiKey();
        console.log("Vérification clé API:", hasApiKey);
        setIsApiKeyValid(hasApiKey);
        
        if (hasApiKey) {
          // Tester la connexion API
          const connected = await testOpenAIConnection();
          console.log("Résultat test connexion:", connected);
          setIsConnected(connected);
          
          if (!connected) {
            setError("Impossible de se connecter à l'API OpenAI");
          }
        } else {
          setIsConnected(false);
          setError("Clé API OpenAI manquante ou invalide");
        }
      } catch (err) {
        console.error("Erreur vérification OpenAI:", err);
        setIsConnected(false);
        setIsApiKeyValid(false);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Exécuter la vérification au montage du composant
    checkConnection();
  }, []);

  return {
    isApiKeyValid,
    isConnected,
    isLoading,
    error,
    checkConnection: async () => {
      setIsLoading(true);
      setError(null);
      const apiKeyValid = checkApiKey();
      setIsApiKeyValid(apiKeyValid);
      
      if (apiKeyValid) {
        const connected = await testOpenAIConnection();
        setIsConnected(connected);
      } else {
        setIsConnected(false);
      }
      
      setIsLoading(false);
      return apiKeyValid && isConnected;
    }
  };
};

// Exporter le hook
export default useOpenAIStatus;
