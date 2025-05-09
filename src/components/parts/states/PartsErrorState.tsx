
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PartsErrorStateProps {
  error: string;
  refetch?: () => void;
}

export const PartsErrorState: React.FC<PartsErrorStateProps> = ({ error, refetch }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" strokeWidth={1.5} />
      <h3 className="text-lg font-medium mb-2">Erreur lors du chargement</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {error || "Une erreur est survenue lors du chargement des pièces."}
      </p>
      {refetch && (
        <Button onClick={refetch}>
          Réessayer
        </Button>
      )}
    </div>
  );
};
