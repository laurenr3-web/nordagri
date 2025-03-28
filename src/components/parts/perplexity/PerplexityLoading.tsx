
import React from 'react';
import { Loader2 } from 'lucide-react';

const PerplexityLoading: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="ml-2">Recherche en cours...</p>
    </div>
  );
};

export default PerplexityLoading;
