
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TechnicalInfoErrorProps {
  error: string;
  onRetry: () => void;
  isApiKeyValid: boolean | null;
}

export const TechnicalInfoError: React.FC<TechnicalInfoErrorProps> = ({
  error,
  onRetry,
  isApiKeyValid
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <AlertCircle className="h-8 w-8 text-destructive mb-2" />
      <p className="text-destructive font-medium">Erreur</p>
      <p className="text-muted-foreground text-center max-w-md mt-2">{error}</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-4"
        onClick={onRetry}
        disabled={!isApiKeyValid}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Réessayer
      </Button>
    </div>
  );
};
