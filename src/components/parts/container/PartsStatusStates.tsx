
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Search } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Chargement...' }) => {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
      <span>{message}</span>
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
    <div className="text-center py-12">
      <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <p className="text-destructive font-medium">{message}</p>
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
    <div className="text-center py-12">
      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">{message}</p>
      {filterActive && onClearFilters && (
        <Button variant="link" onClick={onClearFilters} className="mt-2">
          Effacer les filtres
        </Button>
      )}
    </div>
  );
};
