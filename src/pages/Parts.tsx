
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { PartsContextProvider } from '@/contexts/PartsContext';
import PartsPageContainer from '@/components/parts/page/PartsPageContainer';
import { toast } from 'sonner';
import { useEmergencyParts } from '@/hooks/emergencyPartsHook';
import { partsData } from '@/data/partsData';
import ErrorBoundary from '@/components/ErrorBoundary';

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
  
  // Use the new ErrorBoundary component
  return (
    <React.StrictMode>
      <ErrorBoundary
        fallback={
          <div className="flex min-h-screen w-full bg-background p-8">
            <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-destructive">Error Loading Parts</h2>
              <p className="mb-4">Unable to load the parts management interface.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded"
              >
                Reload Page
              </button>
            </div>
          </div>
        }
      >
        <SidebarProvider>
          <PartsContextProvider>
            <PartsPageContainer />
          </PartsContextProvider>
        </SidebarProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

export default Parts;
