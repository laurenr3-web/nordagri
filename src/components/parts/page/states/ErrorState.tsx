
import React, { useEffect } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { RefreshCw, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cleanupOrphanedPortals } from '@/utils/dom-helpers';

interface ErrorStateProps {
  error: Error | null;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  const isOnline = useNetworkStatus();
  
  // Attempt recovery when component mounts
  useEffect(() => {
    console.log('Attempting to recover from error:', error?.message);
    
    // Try to clean up any orphaned portals
    cleanupOrphanedPortals();
    
    return () => {
      console.log('Error state component unmounted');
    };
  }, [error]);
  
  const handleReload = () => {
    console.log('Attempting to reload the page...');
    
    // Try to clean up before reloading
    try {
      cleanupOrphanedPortals();
      
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.location.reload();
        }, 300);
      });
    } catch (e) {
      console.error('Error during cleanup before reload:', e);
      window.location.reload();
    }
  };

  const errorMessage = error instanceof Error 
    ? error.message 
    : "Unknown error";
    
  const isNodeError = errorMessage.includes('removeChild') || 
                     errorMessage.includes('Node');
                     
  const isNetworkError = errorMessage.includes('network') || 
                         errorMessage.includes('connexion') ||
                         errorMessage.includes('connection') ||
                         !isOnline;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar className="border-r">
        <Navbar />
      </Sidebar>
      
      <div className="flex-1 p-6">
        <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-destructive">
            {isNetworkError ? "Connection Issue" : "Parts Loading Error"}
          </h2>
          
          <p className="mb-4">
            {isNetworkError
              ? "It appears you're offline or unable to connect to the server."
              : isNodeError
                ? "Unable to load the parts management interface due to a DOM manipulation error."
                : "Unable to load the parts management interface."}
          </p>
          
          <div className="bg-destructive/10 p-3 rounded-md mb-4">
            <p className="text-muted-foreground break-words text-sm">
              {errorMessage}
            </p>
          </div>
          
          <Button 
            onClick={handleReload} 
            className="mt-4 w-full flex items-center justify-center gap-2"
          >
            {isNetworkError ? (
              <>
                <WifiOff className="h-4 w-4" />
                Check connection and try again
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </>
            )}
          </Button>
          
          {isNodeError && (
            <p className="text-xs text-muted-foreground mt-3 text-center">
              This error is typically caused by a timing issue when opening/closing dialogs.
              Reloading will apply automatic fixes.
            </p>
          )}
          
          {isNetworkError && (
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Check your internet connection. Some features may be available in offline mode.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
