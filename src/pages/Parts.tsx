
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { PartsContextProvider } from '@/contexts/PartsContext';
import PartsPageContainer from '@/components/parts/page/PartsPageContainer';
import { toast } from 'sonner';
import { useEmergencyParts } from '@/hooks/emergencyPartsHook';
import { partsData } from '@/data/partsData';

const Parts = () => {
  // All hooks declarations at the beginning of the function
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Add mounting check to help with debugging
  useEffect(() => {
    console.log("Parts component mounted");
    return () => {
      console.log("Parts component unmounted");
    };
  }, []);
  
  // Add error boundary to catch and display any context errors
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <SidebarProvider>
          <PartsContextProvider>
            <PartsPageContainer />
          </PartsContextProvider>
        </SidebarProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

// Simple error boundary component to catch rendering errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught in Parts component:", error, errorInfo);
    toast.error("Error loading Parts component", {
      description: error.message
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full bg-background p-8">
          <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-destructive">Error Loading Parts</h2>
            <p className="mb-4">Unable to load the parts management interface.</p>
            <p className="text-muted-foreground">{this.state.error?.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default Parts;
