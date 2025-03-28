
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PerplexityErrorProps {
  error: string;
}

const PerplexityError: React.FC<PerplexityErrorProps> = ({ error }) => {
  return (
    <Alert variant="destructive" className="mt-4">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle>Erreur</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

export default PerplexityError;
