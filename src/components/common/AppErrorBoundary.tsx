
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorDiagnostic } from './ErrorDiagnostic';
import { diagnoseSupabaseConfiguration } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Application Error Boundary:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Diagnostic automatique
    const supabaseDiag = diagnoseSupabaseConfiguration();
    logger.error('Diagnostic Supabase:', supabaseDiag);
    
    // Gestion spécifique des erreurs d'authentification
    if (this.isAuthenticationError(error)) {
      logger.error('Erreur d\'authentification détectée - nettoyage des tokens corrompus');
      this.cleanAuthTokens();
      
      // Recharger automatiquement la page après nettoyage
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    
    // Gestion des erreurs de configuration
    if (this.isConfigurationError(error)) {
      logger.error('Erreur de configuration détectée - affichage de l\'interface de diagnostic');
    }
    
    // Gestion des erreurs React
    if (this.isReactError(error)) {
      logger.error('Erreur React détectée - problème de hook ou de rendu');
    }
  }

  private isAuthenticationError(error: Error): boolean {
    return error.message?.includes('JWT') || 
           error.message?.includes('token') ||
           error.message?.includes('auth') ||
           error.message?.includes('session') ||
           error.message?.includes('malformed') ||
           error.message?.includes('segments') ||
           error.message?.includes('bad_jwt') ||
           error.message?.includes('invalid signature');
  }

  private isConfigurationError(error: Error): boolean {
    return error.message?.includes('Configuration') || 
           error.message?.includes('Variables') ||
           error.message?.includes('VITE_SUPABASE') ||
           !import.meta.env.VITE_SUPABASE_URL;
  }

  private isReactError(error: Error): boolean {
    return error.message?.includes('useState') ||
           error.message?.includes('useEffect') ||
           error.message?.includes('Cannot read properties of null') ||
           error.stack?.includes('renderWithHooks');
  }

  private cleanAuthTokens() {
    try {
      // Nettoyer localStorage - plus exhaustif
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || 
        key.includes('sb-') || 
        key.includes('auth') ||
        key.startsWith('supabase.')
      );
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        logger.log(`Suppression de la clé localStorage: ${key}`);
      });
      
      // Nettoyer sessionStorage
      const sessionKeysToRemove = Object.keys(sessionStorage).filter(key => 
        key.includes('supabase') || 
        key.includes('sb-') || 
        key.includes('auth') ||
        key.startsWith('supabase.')
      );
      
      sessionKeysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
        logger.log(`Suppression de la clé sessionStorage: ${key}`);
      });
      
      // Nettoyer le cache si possible
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }).catch(err => {
          logger.warn('Impossible de nettoyer le cache:', err);
        });
      }
      
      logger.log('Tokens d\'authentification nettoyés après erreur critique');
    } catch (cleanupError) {
      logger.error('Erreur lors du nettoyage des tokens:', cleanupError);
    }
  }

  public render() {
    if (this.state.hasError) {
      const isConfigError = this.isConfigurationError(this.state.error!);
      const isAuthError = this.isAuthenticationError(this.state.error!);
      const isReactError = this.isReactError(this.state.error!);
      
      let title = "Erreur de l'application";
      let description = "Une erreur inattendue s'est produite.";
      
      if (isConfigError) {
        title = "Erreur de configuration";
        description = "Les variables d'environnement Supabase ne sont pas configurées correctement.";
      } else if (isAuthError) {
        title = "Erreur d'authentification";
        description = "Un problème d'authentification s'est produit. La page va se recharger automatiquement pour corriger le problème.";
      } else if (isReactError) {
        title = "Erreur de rendu React";
        description = "Un problème de composant React s'est produit. Essayez de recharger la page.";
      }
      
      return (
        <ErrorDiagnostic 
          error={this.state.error}
          title={title}
          description={description}
        />
      );
    }

    return this.props.children;
  }
}
