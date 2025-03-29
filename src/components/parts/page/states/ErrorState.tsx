
import React from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';

interface ErrorStateProps {
  error: Error | null;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar className="border-r">
        <Navbar />
      </Sidebar>
      
      <div className="flex-1 p-6">
        <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-destructive">Error Loading Parts</h2>
          <p className="mb-4">Unable to load the parts management interface. This could be due to a context provider issue.</p>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : "Unknown error"}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
