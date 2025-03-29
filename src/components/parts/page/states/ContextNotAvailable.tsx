
import React from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';

const ContextNotAvailable: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar className="border-r">
        <Navbar />
      </Sidebar>
      <div className="flex-1 p-6">
        <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-destructive">Context Not Available</h2>
          <p className="mb-4">The parts management context could not be accessed.</p>
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

export default ContextNotAvailable;
