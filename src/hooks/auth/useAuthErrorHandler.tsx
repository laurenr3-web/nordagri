
import { useCallback } from 'react';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

/**
 * Hook pour gérer les erreurs d'authentification de manière centralisée
 */
export function useAuthErrorHandler() {
  const handleAuthError = useCallback((error: any, context: string = 'authentication') => {
    logger.error(`Erreur d'authentification dans ${context}:`, error);
    
    // Gérer les erreurs JWT spécifiques avec plus de détails
    if (error?.message?.includes('JWT') || error?.message?.includes('token')) {
      if (error.message.includes('malformed') || 
          error.message.includes('invalid number of segments') ||
          error.message.includes('invalid signature') ||
          error.message.includes('invalid algorithm')) {
        logger.warn('Token JWT malformé ou invalide détecté, nettoyage recommandé');
        return 'token_malformed';
      }
      
      if (error.message.includes('expired') || error.message.includes('exp claim')) {
        logger.warn('Token expiré détecté');
        return 'token_expired';
      }
      
      return 'token_error';
    }
    
    // Gérer les erreurs Supabase spécifiques
    if (error?.code === 'bad_jwt' || error?.error_code === 'bad_jwt') {
      logger.warn('Erreur bad_jwt détectée');
      return 'token_malformed';
    }
    
    // Gérer les erreurs de réseau
    if (error?.message?.includes('Failed to fetch') || 
        error?.message?.includes('Network') ||
        error?.message?.includes('fetch')) {
      logger.warn('Erreur de réseau détectée');
      return 'network_error';
    }
    
    // Gérer les erreurs de configuration
    if (error?.message?.includes('Configuration') || 
        error?.message?.includes('Variables') ||
        error?.message?.includes('VITE_SUPABASE')) {
      logger.error('Erreur de configuration détectée');
      return 'config_error';
    }
    
    // Gérer les erreurs 403 spécifiquement
    if (error?.status === 403 || error?.code === 403) {
      logger.warn('Erreur 403 - Accès refusé, tokens probablement corrompus');
      return 'token_malformed';
    }
    
    return 'unknown_error';
  }, []);

  const showUserFriendlyError = useCallback((errorType: string, originalError?: any) => {
    switch (errorType) {
      case 'token_malformed':
        toast.error('Session corrompue', {
          description: 'Votre session a été automatiquement réinitialisée. La page va se recharger.',
          duration: 5000
        });
        // Recharger automatiquement la page après nettoyage
        setTimeout(() => {
          window.location.reload();
        }, 2000);
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
        if (originalError?.message && 
            !originalError.message.includes('AbortError') &&
            !originalError.message.includes('cancelled')) {
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
