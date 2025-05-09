
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
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
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
