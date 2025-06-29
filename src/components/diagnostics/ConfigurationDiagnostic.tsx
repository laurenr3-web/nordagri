
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const ConfigurationDiagnostic: React.FC = () => {
  const isDev = import.meta.env.DEV;
  const mode = import.meta.env.MODE;
  const hasEnvUrl = !!import.meta.env.VITE_SUPABASE_URL;
  const hasEnvKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cagmgtmeljxykyngxxmj.supabase.co';
  
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
              Utilise les valeurs par défaut
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

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Configuration de fallback</span>
            <div className="flex items-center gap-2">
              <Badge variant={usingFallbacks ? "secondary" : "default"}>
                {usingFallbacks ? "Active" : "Inactive"}
              </Badge>
              <StatusIcon status={usingFallbacks ? "warning" : "ok"} />
            </div>
          </div>
        </div>

        {usingFallbacks && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Attention :</strong> L'application utilise des valeurs par défaut car les variables d'environnement 
              VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY ne sont pas configurées sur votre plateforme de déploiement.
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              Pour résoudre ce problème en production, configurez ces variables sur votre plateforme de déploiement.
            </p>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>Mode: {mode}</p>
          <p>URL: {supabaseUrl}</p>
          <p>Clé env présente: {hasEnvKey ? 'Oui' : 'Non'}</p>
        </div>
      </CardContent>
    </Card>
  );
};
