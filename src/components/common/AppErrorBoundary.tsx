
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorDiagnostic } from './ErrorDiagnostic';
import { diagnoseSupabaseConfiguration } from '@/utils/supabaseClient';

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
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorDiagnostic 
          error={this.state.error}
          title="Erreur de l'application"
          description="Une erreur inattendue s'est produite. Voici le diagnostic automatique :"
        />
      );
    }

    return this.props.children;
  }
}
