
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
      message: "VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être configurées",
      status: import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY ? 'OK' : 'Configuration manquante'
    },
    {
      name: "URL Supabase valide",
      check: () => {
        const url = import.meta.env.VITE_SUPABASE_URL || "https://cagmgtmeljxykyngxxmj.supabase.co";
        return url && url.startsWith('https://') && url.includes('.supabase.co');
      },
      message: "L'URL Supabase doit être au format https://xxx.supabase.co",
      status: (() => {
        const url = import.meta.env.VITE_SUPABASE_URL || "https://cagmgtmeljxykyngxxmj.supabase.co";
        return url && url.startsWith('https://') && url.includes('.supabase.co') ? 'OK' : 'Format invalide';
      })()
    },
    {
      name: "Mode de déploiement",
      check: () => import.meta.env.PROD,
      message: "Application en mode développement",
      status: import.meta.env.PROD ? 'Production' : 'Développement'
    },
    {
      name: "Connexion réseau",
      check: () => navigator.onLine,
      message: "Vérifiez votre connexion internet",
      status: navigator.onLine ? 'Connecté' : 'Hors ligne'
    }
  ];

  const handleReload = () => {
    if (typeof window !== 'undefined' && window.location && typeof window.location.reload === 'function') {
      window.location.reload();
    }
  };

  const clearCache = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      if ('caches' in window && window.caches && typeof window.caches.keys === 'function') {
        const cacheNames = await window.caches.keys();
        await Promise.all(
          cacheNames.map(name => window.caches.delete(name))
        );
      }
      
      // Clear localStorage
      if (window.localStorage) {
        window.localStorage.clear();
      }
      
      // Clear sessionStorage
      if (window.sessionStorage) {
        window.sessionStorage.clear();
      }
    } catch (error) {
      console.warn('Erreur lors du nettoyage du cache:', error);
    } finally {
      if (window.location && typeof window.location.reload === 'function') {
        window.location.reload();
      }
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
                    {diagnostic.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {!import.meta.env.VITE_SUPABASE_URL && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-semibold text-yellow-800 mb-2">Instructions de configuration :</h4>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Ajoutez VITE_SUPABASE_URL dans vos variables d'environnement</li>
                <li>2. Ajoutez VITE_SUPABASE_ANON_KEY dans vos variables d'environnement</li>
                <li>3. Redéployez votre application</li>
              </ol>
            </div>
          )}
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
            Vider le cache et recharger
          </Button>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Si le problème persiste, vérifiez que les variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont configurées sur votre plateforme d'hébergement.</p>
        </div>
      </div>
    </div>
  );
};
