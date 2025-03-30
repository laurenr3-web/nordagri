
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'sonner';

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
    toast.error("An error occurred", {
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
  
  handleDOMError = (): void => {
    console.log("Attempting to recover from DOM error...");
    
    // Clean up orphaned portals
    try {
      const portals = document.querySelectorAll('[data-radix-portal]');
      portals.forEach(portal => {
        if (portal.children.length === 0 && portal.parentNode) {
          try {
            portal.parentNode.removeChild(portal);
            console.log("Cleaned up orphaned portal");
          } catch (e) {
            console.warn('Portal cleanup error:', e);
          }
        }
      });
    } catch (error) {
      console.error("Error during portal cleanup:", error);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-300 rounded bg-red-50">
          <h2 className="text-lg font-semibold text-red-700">Something went wrong</h2>
          <p className="text-red-600 mt-2">{this.state.error?.message}</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
