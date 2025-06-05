
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

/**
 * Hook pour valider et nettoyer les tokens d'authentification
 */
export function useTokenValidation() {
  const [isValidating, setIsValidating] = useState(false);

  const validateAndCleanTokens = async () => {
    setIsValidating(true);
    
    try {
      // Utiliser l'URL Supabase depuis les variables d'environnement
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://cagmgtmeljxykyngxxmj.supabase.co";
      const localStorageKey = `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
      const storedSession = localStorage.getItem(localStorageKey);
      
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          
          // Vérifier si le token n'est pas malformé
          if (parsedSession.access_token) {
            const tokenParts = parsedSession.access_token.split('.');
            if (tokenParts.length !== 3) {
              logger.warn('Token JWT malformé détecté, nettoyage en cours...');
              await cleanCorruptedTokens();
              return false;
            }
          }
        } catch (error) {
          logger.error('Erreur lors du parsing de la session stockée:', error);
          await cleanCorruptedTokens();
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Erreur lors de la validation des tokens:', error);
      await cleanCorruptedTokens();
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const cleanCorruptedTokens = async () => {
    try {
      logger.log('Nettoyage des tokens corrompus...');
      
      // Nettoyer localStorage
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('sb-')
      );
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Nettoyer sessionStorage
      const sessionKeysToRemove = Object.keys(sessionStorage).filter(key => 
        key.includes('supabase') || key.includes('sb-')
      );
      
      sessionKeysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      // Signaler à Supabase de nettoyer sa session
      await supabase.auth.signOut({ scope: 'local' });
      
      logger.log('Tokens corrompus nettoyés avec succès');
    } catch (error) {
      logger.error('Erreur lors du nettoyage des tokens:', error);
    }
  };

  return {
    validateAndCleanTokens,
    cleanCorruptedTokens,
    isValidating
  };
}
