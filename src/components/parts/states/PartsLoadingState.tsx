
import React from 'react';
import { CircleNotch } from '@phosphor-icons/react';

export const PartsLoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <CircleNotch size={32} className="text-primary animate-spin mb-4" weight="bold" />
      <h3 className="text-lg font-medium mb-2">Chargement des pièces...</h3>
      <p className="text-muted-foreground max-w-md">
        Veuillez patienter pendant que nous récupérons les données de votre inventaire.
      </p>
    </div>
  );
};
