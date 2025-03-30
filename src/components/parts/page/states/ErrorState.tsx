
import React, { useEffect, useRef } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface ErrorStateProps {
  error: Error | null;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  const isOnline = useNetworkStatus();
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  
  // Cleanup function for any resources
  useEffect(() => {
    return () => {
      // Clean up any script elements that were created
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
      
      // Clean up any pending timeouts
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  const handleReload = () => {
    console.log('Tentative de rechargement de la page...');
    
    // Charger les scripts de réparation avant de recharger
    try {
      if (scriptRef.current) {
        // Remove existing script if it exists
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
      
      const script = document.createElement('script');
      script.src = '/fix-all.js';
      document.head.appendChild(script);
      scriptRef.current = script;
      
      script.onload = () => {
        console.log('Scripts de réparation chargés, rechargement...');
        // Use requestAnimationFrame for better timing
        requestAnimationFrame(() => {
          timeoutRef.current = window.setTimeout(() => {
            window.location.reload();
          }, 500);
        });
      };
      
      script.onerror = (e) => {
        console.error('Erreur lors du chargement des scripts de réparation:', e);
        window.location.reload();
      };
    } catch (e) {
      console.error('Erreur lors du chargement des scripts de réparation:', e);
      window.location.reload();
    }
  };

  const errorMessage = error instanceof Error 
    ? error.message 
    : "Erreur inconnue";
    
  const isNodeError = errorMessage.includes('removeChild') || 
                     errorMessage.includes('Node');
                     
  const isNetworkError = errorMessage.includes('network') || 
                         errorMessage.includes('connexion') ||
                         errorMessage.includes('connection') ||
                         !isOnline;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar className="border-r">
        <Navbar />
      </Sidebar>
      
      <div className="flex-1 p-6">
        <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-destructive">
            {isNetworkError ? "Problème de connexion" : "Erreur de chargement des pièces"}
          </h2>
          
          <p className="mb-4">
            {isNetworkError
              ? "Il semble que vous soyez hors ligne ou que la connexion au serveur soit impossible."
              : isNodeError
                ? "Impossible de charger l'interface de gestion des pièces en raison d'une erreur de manipulation du DOM."
                : "Impossible de charger l'interface de gestion des pièces."}
          </p>
          
          <div className="bg-destructive/10 p-3 rounded-md mb-4">
            <p className="text-muted-foreground break-words text-sm">
              {errorMessage}
            </p>
          </div>
          
          <Button 
            onClick={handleReload} 
            className="mt-4 w-full flex items-center justify-center gap-2"
          >
            {isNetworkError ? (
              <>
                <WifiOff className="h-4 w-4" />
                Vérifier la connexion et réessayer
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Recharger la page
              </>
            )}
          </Button>
          
          {isNodeError && (
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Cette erreur est généralement causée par un problème de timing lors de l'ouverture/fermeture des dialogues.
              Le rechargement appliquera automatiquement des correctifs.
            </p>
          )}
          
          {isNetworkError && (
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Vérifiez votre connexion internet. Certaines fonctionnalités peuvent être disponibles en mode hors ligne.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
