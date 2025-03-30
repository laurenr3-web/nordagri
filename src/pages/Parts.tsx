
import React, { useState, useEffect, Suspense } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { PartsContextProvider } from '@/contexts/PartsContext';
import PartsPageContainer from '@/components/parts/page/PartsPageContainer';
import { toast } from 'sonner';
import { useEmergencyParts } from '@/hooks/emergencyPartsHook';
import { partsData } from '@/data/partsData';
import ErrorBoundary from '@/components/ErrorBoundary';
import { TechnicalInfoLoading } from '@/components/parts/technical-info/TechnicalInfoLoading';
import LoadingState from '@/components/parts/page/states/LoadingState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const Parts = () => {
  // All hooks declarations at the beginning of the function
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add mounting check to help with debugging
  useEffect(() => {
    console.log("Parts component mounted");
    
    // Simulate loading to ensure smooth UI transitions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => {
      console.log("Parts component unmounted");
      clearTimeout(timer);
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
            <Suspense fallback={<LoadingState />}>
              {isLoading ? (
                <div className="flex justify-center items-center min-h-[80vh]">
                  <LoadingSpinner size="lg" text="Loading parts management interface..." />
                </div>
              ) : (
                <PartsPageContainer />
              )}
            </Suspense>
          </PartsContextProvider>
        </SidebarProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

export default Parts;
