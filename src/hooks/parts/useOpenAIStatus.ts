
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
            setError("Impossible de se connecter à l'API OpenAI. La clé pourrait être non valide ou le service indisponible.");
            setIsApiKeyValid(false);
          }
        } else {
          setIsConnected(false);
          setError("Clé API OpenAI manquante ou au format incorrect. Format attendu: commençant par 'sk-'");
        }
      } catch (err) {
        console.error("Erreur vérification OpenAI:", err);
        setIsConnected(false);
        setIsApiKeyValid(false);
        
        // Message d'erreur plus détaillé
        if (err.status === 401) {
          setError("Authentification OpenAI échouée. Vérifiez que votre clé API est valide et active.");
        } else {
          setError(err instanceof Error ? err.message : "Erreur inconnue lors de la connexion à OpenAI");
        }
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
        try {
          const connected = await testOpenAIConnection();
          setIsConnected(connected);
          
          if (!connected) {
            setError("Impossible de se connecter à l'API OpenAI. La clé pourrait être non valide ou le service indisponible.");
          }
        } catch (err) {
          setIsConnected(false);
          if (err.status === 401) {
            setError("Authentification OpenAI échouée. Vérifiez que votre clé API est valide et active.");
          } else {
            setError(err instanceof Error ? err.message : "Erreur inconnue lors de la connexion à OpenAI");
          }
        }
      } else {
        setIsConnected(false);
        setError("Clé API OpenAI manquante ou au format incorrect");
      }
      
      setIsLoading(false);
      return apiKeyValid && isConnected;
    }
  };
};

// Exporter le hook
export default useOpenAIStatus;
