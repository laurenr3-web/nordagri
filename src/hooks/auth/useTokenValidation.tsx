
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
            
            // Vérifier le refresh token aussi
            if (parsedSession.refresh_token) {
              const refreshTokenParts = parsedSession.refresh_token.split('.');
              if (refreshTokenParts.length !== 3) {
                logger.warn('Refresh token JWT malformé détecté, nettoyage en cours...');
                await cleanCorruptedTokens();
                return false;
              }
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
      
      // Nettoyer localStorage - suppression ciblée des clés Supabase
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('sb-') || key.startsWith('supabase.')
      );
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        logger.log(`Suppression de la clé localStorage: ${key}`);
      });
      
      // Nettoyer sessionStorage
      const sessionKeysToRemove = Object.keys(sessionStorage).filter(key => 
        key.includes('supabase') || key.includes('sb-') || key.startsWith('supabase.')
      );
      
      sessionKeysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
        logger.log(`Suppression de la clé sessionStorage: ${key}`);
      });
      
      // Signaler à Supabase de nettoyer sa session locale uniquement
      await supabase.auth.signOut({ scope: 'local' });
      
      // Vider le cache du navigateur si possible
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
          logger.log('Cache du navigateur nettoyé');
        } catch (cacheError) {
          logger.warn('Impossible de nettoyer le cache:', cacheError);
        }
      }
      
      logger.log('Tokens corrompus nettoyés avec succès');
    } catch (error) {
      logger.error('Erreur lors du nettoyage des tokens:', error);
    }
  };

  // Nettoyage automatique au chargement si des tokens corrompus sont détectés
  useEffect(() => {
    const autoCleanOnLoad = async () => {
      const isValid = await validateAndCleanTokens();
      if (!isValid) {
        logger.warn('Session corrompue détectée et nettoyée automatiquement');
      }
    };
    
    autoCleanOnLoad();
  }, []);

  return {
    validateAndCleanTokens,
    cleanCorruptedTokens,
    isValidating
  };
}
