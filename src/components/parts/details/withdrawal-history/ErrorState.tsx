
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Historique des retraits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorState;
