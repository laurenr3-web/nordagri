
import React from 'react';
import { Loader2 } from 'lucide-react';

export const PartsLoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Loader2 size={32} className="text-primary animate-spin mb-4" />
      <h3 className="text-lg font-medium mb-2">Chargement des pièces...</h3>
      <p className="text-muted-foreground max-w-md">
        Veuillez patienter pendant que nous récupérons les données de votre inventaire.
      </p>
    </div>
  );
};
