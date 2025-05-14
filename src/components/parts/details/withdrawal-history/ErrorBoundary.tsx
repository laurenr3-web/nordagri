
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class WithdrawalHistoryErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WithdrawalHistory error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Historique des retraits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
              <p className="text-muted-foreground">
                Une erreur s'est produite lors du chargement de l'historique
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3" 
                onClick={() => window.location.reload()}
              >
                Recharger la page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
