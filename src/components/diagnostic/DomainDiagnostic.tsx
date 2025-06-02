
import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { checkSupabaseConnection } from '@/integrations/supabase/client';
import { productionConfig } from '@/config/productionConfig';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'loading';
  message: string;
}

export const DomainDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // Test 1: Variables d'environnement
    results.push({
      name: 'Variables d\'environnement',
      status: import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY ? 'success' : 'error',
      message: import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY 
        ? 'Variables configurées correctement' 
        : 'Variables manquantes ou incorrectes'
    });

    // Test 2: Configuration du domaine
    results.push({
      name: 'Configuration du domaine',
      status: 'success',
      message: `Domaine: ${productionConfig.currentDomain}, Timeout: ${productionConfig.timeout}ms`
    });

    // Test 3: Connexion Supabase
    try {
      const connected = await checkSupabaseConnection();
      results.push({
        name: 'Connexion Supabase',
        status: connected ? 'success' : 'error',
        message: connected ? 'Connexion établie' : 'Impossible de se connecter'
      });
    } catch (error) {
      results.push({
        name: 'Connexion Supabase',
        status: 'error',
        message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
    }

    // Test 4: Stockage local
    try {
      localStorage.setItem('diagnostic-test', 'ok');
      localStorage.removeItem('diagnostic-test');
      results.push({
        name: 'Stockage local',
        status: 'success',
        message: 'Stockage local disponible'
      });
    } catch (error) {
      results.push({
        name: 'Stockage local',
        status: 'error',
        message: 'Stockage local indisponible'
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    // Exécuter les diagnostics automatiquement sur nordagri.ca
    if (productionConfig.currentDomain === 'nordagri.ca') {
      runDiagnostics();
    }
  }, []);

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const hasErrors = diagnostics.some(d => d.status === 'error');

  return (
    <div className="space-y-4">
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Problèmes détectés</AlertTitle>
          <AlertDescription>
            Des problèmes de configuration ont été détectés. Cela peut expliquer la page blanche.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Diagnostic du système</h3>
          <Button onClick={runDiagnostics} disabled={isRunning} size="sm">
            {isRunning && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isRunning ? 'Test en cours...' : 'Relancer les tests'}
          </Button>
        </div>

        {diagnostics.map((diagnostic, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
            {getIcon(diagnostic.status)}
            <div className="flex-1">
              <div className="font-medium">{diagnostic.name}</div>
              <div className="text-sm text-muted-foreground">{diagnostic.message}</div>
            </div>
          </div>
        ))}
      </div>

      {productionConfig.currentDomain === 'nordagri.ca' && (
        <Alert>
          <AlertTitle>Configuration nordagri.ca</AlertTitle>
          <AlertDescription>
            Domaine de production détecté. Configuration spéciale appliquée avec timeout étendu et retry automatique.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
