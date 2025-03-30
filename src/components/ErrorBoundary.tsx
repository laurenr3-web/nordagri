
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'sonner';
import { cleanupOrphanedPortals, patchDomOperations } from '@/utils/dom-helpers';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Uncaught error:", error, errorInfo);
    
    // Show toast notification for the error
    toast.error("Une erreur s'est produite", {
      description: error.message,
    });
    
    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Handle DOM manipulation errors
    if (error.message && (
      error.message.includes('removeChild') || 
      error.message.includes('appendChild') || 
      error.message.includes('insertBefore')
    )) {
      this.handleDOMError();
    }
  }
  
  componentDidMount() {
    // Apply DOM operation patches when the component mounts
    patchDomOperations();
  }
  
  handleDOMError = (): void => {
    console.log("Tentative de récupération après erreur DOM...");
    
    // Clean up orphaned portals
    cleanupOrphanedPortals();
    
    // Attempt to patch DOM methods if not already done
    patchDomOperations();
    
    // Force update after a small delay to allow React to stabilize
    setTimeout(() => {
      this.setState({ hasError: false });
    }, 100);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 border border-red-300 rounded bg-red-50">
          <h2 className="text-xl font-semibold text-red-700">Une erreur est survenue</h2>
          <p className="text-red-600 mt-2">{this.state.error?.message}</p>
          <button 
            onClick={() => {
              cleanupOrphanedPortals();
              this.setState({ hasError: false });
            }}
            className="mt-4 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
