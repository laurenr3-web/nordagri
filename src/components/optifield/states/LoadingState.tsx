
import React from 'react';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const LoadingState: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="flex-1 md:ml-64 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-lg font-medium">Chargement d'OptiField...</p>
          <p className="text-sm text-muted-foreground">Préparation de vos données agricoles</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
