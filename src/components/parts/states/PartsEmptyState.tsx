
import React from 'react';
import { Inbox, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PartsEmptyStateProps {
  onClearFilters?: () => void;
}

export const PartsEmptyState: React.FC<PartsEmptyStateProps> = ({ onClearFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {onClearFilters ? (
        <>
          <FilterX className="h-12 w-12 text-muted-foreground mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-medium mb-2">Aucune pièce ne correspond à ces filtres</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Essayez d'ajuster vos filtres ou de réinitialiser tous les filtres pour voir plus de résultats.
          </p>
          <Button onClick={onClearFilters}>
            Réinitialiser les filtres
          </Button>
        </>
      ) : (
        <>
          <Inbox className="h-12 w-12 text-muted-foreground mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-medium mb-2">Aucune pièce disponible</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Commencez par ajouter des pièces à votre inventaire pour les voir apparaître ici.
          </p>
        </>
      )}
    </div>
  );
};
