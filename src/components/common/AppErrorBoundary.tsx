
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorDiagnostic } from './ErrorDiagnostic';
import { diagnoseSupabaseConfiguration } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application Error Boundary:', error, errorInfo);
    
    // Diagnostic automatique
    const supabaseDiag = diagnoseSupabaseConfiguration();
    console.error('Diagnostic Supabase:', supabaseDiag);
    
    // Check if this is a configuration error
    if (error.message?.includes('Configuration') || 
        error.message?.includes('Variables') ||
        error.message?.includes('VITE_SUPABASE') ||
        !import.meta.env.VITE_SUPABASE_URL) {
      console.error('Configuration error detected - showing diagnostic interface');
    }
  }

  public render() {
    if (this.state.hasError) {
      // Check if this is likely a configuration issue
      const isConfigError = !import.meta.env.VITE_SUPABASE_URL || 
                           !import.meta.env.VITE_SUPABASE_ANON_KEY ||
                           this.state.error?.message?.includes('Configuration');
      
      return (
        <ErrorDiagnostic 
          error={this.state.error}
          title={isConfigError ? "Erreur de configuration" : "Erreur de l'application"}
          description={isConfigError ? 
            "Les variables d'environnement Supabase ne sont pas configurées correctement." :
            "Une erreur inattendue s'est produite. Voici le diagnostic automatique :"
          }
        />
      );
    }

    return this.props.children;
  }
}
