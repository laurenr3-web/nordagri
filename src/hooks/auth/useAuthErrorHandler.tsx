
import { useCallback } from 'react';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

/**
 * Hook pour gérer les erreurs d'authentification de manière centralisée
 */
export function useAuthErrorHandler() {
  const handleAuthError = useCallback((error: any, context: string = 'authentication') => {
    logger.error(`Erreur d'authentification dans ${context}:`, error);
    
    // Gérer les erreurs JWT spécifiques
    if (error?.message?.includes('JWT') || error?.message?.includes('token')) {
      if (error.message.includes('malformed') || error.message.includes('invalid number of segments')) {
        logger.warn('Token JWT malformé détecté, nettoyage recommandé');
        return 'token_malformed';
      }
      
      if (error.message.includes('expired')) {
        logger.warn('Token expiré détecté');
        return 'token_expired';
      }
      
      return 'token_error';
    }
    
    // Gérer les erreurs de réseau
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('Network')) {
      logger.warn('Erreur de réseau détectée');
      return 'network_error';
    }
    
    // Gérer les erreurs de configuration
    if (error?.message?.includes('Configuration') || error?.message?.includes('Variables')) {
      logger.error('Erreur de configuration détectée');
      return 'config_error';
    }
    
    return 'unknown_error';
  }, []);

  const showUserFriendlyError = useCallback((errorType: string, originalError?: any) => {
    switch (errorType) {
      case 'token_malformed':
        toast.error('Session corrompue', {
          description: 'Votre session a été réinitialisée. Veuillez vous reconnecter.',
          duration: 5000
        });
        break;
      
      case 'token_expired':
        toast.info('Session expirée', {
          description: 'Veuillez vous reconnecter pour continuer.',
          duration: 4000
        });
        break;
      
      case 'network_error':
        toast.error('Problème de connexion', {
          description: 'Vérifiez votre connexion internet et réessayez.',
          duration: 5000
        });
        break;
      
      case 'config_error':
        toast.error('Erreur de configuration', {
          description: 'Les services ne sont pas correctement configurés.',
          duration: 8000
        });
        break;
      
      default:
        if (originalError?.message && !originalError.message.includes('AbortError')) {
          toast.error('Erreur d\'authentification', {
            description: 'Une erreur inattendue s\'est produite.',
            duration: 4000
          });
        }
        break;
    }
  }, []);

  return {
    handleAuthError,
    showUserFriendlyError
  };
}
