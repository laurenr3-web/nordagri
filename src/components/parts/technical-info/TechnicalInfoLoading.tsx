
import React from 'react';
import { Loader2 } from 'lucide-react';

export const TechnicalInfoLoading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin mb-2" />
      <p className="text-muted-foreground">Recherche des informations techniques...</p>
    </div>
  );
};
