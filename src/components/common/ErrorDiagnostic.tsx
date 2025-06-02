
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDiagnosticProps {
  error?: Error;
  title?: string;
  description?: string;
}

export const ErrorDiagnostic = ({ 
  error, 
  title = "Erreur de configuration", 
  description = "L'application ne peut pas se connecter aux services nécessaires." 
}: ErrorDiagnosticProps) => {
  const diagnostics = [
    {
      name: "Variables d'environnement Supabase",
      check: () => !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
      message: "VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être configurées"
    },
    {
      name: "URL Supabase valide",
      check: () => {
        const url = import.meta.env.VITE_SUPABASE_URL;
        return url && url.startsWith('https://') && url.includes('.supabase.co');
      },
      message: "L'URL Supabase doit être au format https://xxx.supabase.co"
    },
    {
      name: "Mode de production",
      check: () => import.meta.env.PROD,
      message: "Application en mode développement"
    }
  ];

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const clearCache = () => {
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
        window.location.reload();
      });
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-2xl w-full space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Diagnostic de configuration</h3>
          <div className="space-y-3">
            {diagnostics.map((diagnostic, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <span className="font-medium">{diagnostic.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${diagnostic.check() ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`text-sm ${diagnostic.check() ? 'text-green-600' : 'text-red-600'}`}>
                    {diagnostic.check() ? 'OK' : diagnostic.message}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Détails de l'erreur</h3>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {error.message}
              {error.stack && '\n\n' + error.stack}
            </pre>
          </div>
        )}

        <div className="flex gap-4">
          <Button onClick={handleReload} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recharger la page
          </Button>
          <Button onClick={clearCache} variant="outline" className="flex-1">
            Vider le cache
          </Button>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Si le problème persiste, vérifiez que les variables d'environnement sont configurées sur votre plateforme d'hébergement.</p>
        </div>
      </div>
    </div>
  );
};
