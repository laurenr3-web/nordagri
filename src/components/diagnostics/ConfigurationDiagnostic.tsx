
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const ConfigurationDiagnostic: React.FC = () => {
  const isDev = import.meta.env.DEV;
  const mode = import.meta.env.MODE;
  const hasEnvUrl = !!import.meta.env.VITE_SUPABASE_URL;
  const hasEnvKey = !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  
  const isValidUrl = supabaseUrl && supabaseUrl.includes('supabase.co');
  const usingFallbacks = !hasEnvUrl || !hasEnvKey;

  const StatusIcon = ({ status }: { status: 'ok' | 'warning' | 'error' }) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatus = (condition: boolean): 'ok' | 'error' => {
    return condition ? 'ok' : 'error';
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Diagnostic de configuration
          {usingFallbacks && (
            <Badge variant="outline" className="text-yellow-600">
              Configuration manquante
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Mode d'environnement</span>
            <div className="flex items-center gap-2">
              <Badge variant={isDev ? "default" : "secondary"}>
                {mode} {isDev ? "(développement)" : "(production)"}
              </Badge>
              <StatusIcon status="ok" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Variables d'environnement Supabase</span>
            <div className="flex items-center gap-2">
              <Badge variant={hasEnvUrl && hasEnvKey ? "default" : "destructive"}>
                {hasEnvUrl && hasEnvKey ? "Configurées" : "Manquantes"}
              </Badge>
              <StatusIcon status={getStatus(hasEnvUrl && hasEnvKey)} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">URL Supabase valide</span>
            <div className="flex items-center gap-2">
              <Badge variant={isValidUrl ? "default" : "destructive"}>
                {isValidUrl ? "Valide" : "Invalide"}
              </Badge>
              <StatusIcon status={getStatus(isValidUrl)} />
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>Mode: {mode}</p>
          <p>URL: {supabaseUrl}</p>
          <p>Clé env présente: {hasEnvKey ? 'Oui' : 'Non'}</p>
        </div>
      </CardContent>
    </Card>
  );
};
