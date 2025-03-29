
import React from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';

const LoadingState: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar className="border-r">
        <Navbar />
      </Sidebar>
      <div className="flex-1 p-6">
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse">
            <p className="text-muted-foreground">Initializing parts management...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
