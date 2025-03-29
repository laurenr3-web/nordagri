
import { useState, useEffect } from 'react';
import { checkApiKey, testOpenAIConnection } from '@/services/openai/client';

export const useOpenAIStatus = () => {
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      setIsConnecting(true);
      setConnectionError(null);
      
      const hasApiKey = checkApiKey();
      if (!hasApiKey) {
        setIsApiKeyValid(false);
        setConnectionError("Clé API OpenAI manquante dans les variables d'environnement");
        setIsConnecting(false);
        return;
      }
      
      try {
        const isConnected = await testOpenAIConnection();
        setIsApiKeyValid(isConnected);
        
        if (!isConnected) {
          setConnectionError("Échec de la connexion à l'API OpenAI");
        }
      } catch (error) {
        console.error("Erreur de vérification API:", error);
        setIsApiKeyValid(false);
        setConnectionError(error instanceof Error ? error.message : "Erreur inconnue");
      } finally {
        setIsConnecting(false);
      }
    };
    
    checkConnection();
  }, []);

  return {
    isApiKeyValid,
    isConnecting,
    connectionError
  };
};
