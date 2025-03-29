
import React from 'react';
import { Button } from '@/components/ui/button';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Chargement...' }) => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      <span className="ml-3">{message}</span>
    </div>
  );
};

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = 'Une erreur est survenue lors du chargement des pièces.',
  onRetry
}) => {
  return (
    <div className="text-center py-12 text-destructive">
      <p>{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  message?: string;
  filterActive?: boolean;
  onClearFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = 'Aucune pièce trouvée avec les critères actuels.',
  filterActive = false,
  onClearFilters
}) => {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p>{message}</p>
      {filterActive && onClearFilters && (
        <Button variant="link" onClick={onClearFilters} className="mt-2">
          Effacer les filtres
        </Button>
      )}
    </div>
  );
};
