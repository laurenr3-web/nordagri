
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/providers/AuthProvider';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { checkAuthStatus } from '@/utils/authUtils';

export const AuthDebugger: React.FC = () => {
  const { user, session, isAuthenticated } = useAuthContext();
  const [checking, setChecking] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runAuthCheck = async () => {
    setChecking(true);
    setError(null);
    
    try {
      // Récupérer la session actuelle
      const { data, error } = await supabase.auth.getSession();
      
      // Vérifier explicitement l'état de l'authentification
      const authStatus = await checkAuthStatus();
      
      // Récupérer des informations sur les politiques RLS pour le débogage
      const { data: rlsData, error: rlsError } = await supabase
        .from('maintenance_tasks')
        .select('id, title')
        .limit(1);
      
      // Récupérer une intervention pour le débogage
      const { data: interventionData, error: interventionError } = await supabase
        .from('interventions')
        .select('id, title')
        .limit(1);
      
      setDebugInfo({
        session: data.session,
        authStatus,
        user: {
          id: user?.id || 'Non connecté',
          email: user?.email || 'Non connecté',
          lastSignIn: user?.last_sign_in_at || 'N/A'
        },
        maintenanceTasksAccess: {
          data: rlsData,
          error: rlsError ? rlsError.message : null
        },
        interventionsAccess: {
          data: interventionData,
          error: interventionError ? interventionError.message : null
        }
      });
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la vérification');
      console.error('Erreur de débogage:', err);
    } finally {
      setChecking(false);
    }
  };

  const refreshSession = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      setDebugInfo({
        session: data.session,
        message: 'Session rafraîchie avec succès'
      });
    } catch (err: any) {
      setError(err.message || 'Impossible de rafraîchir la session');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Statut d'authentification</h3>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <span className="flex items-center gap-1 text-green-600">
              <Check className="h-4 w-4" /> Connecté
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-600">
              <AlertCircle className="h-4 w-4" /> Non connecté
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Utilisateur</p>
          <p className="font-mono text-xs truncate">{user?.id || 'Non connecté'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Email</p>
          <p className="font-mono text-xs truncate">{user?.email || 'Non connecté'}</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {debugInfo && (
        <div className="mb-4">
          <details className="text-xs">
            <summary className="cursor-pointer mb-2 text-blue-600">Détails du débogage (cliquez pour afficher)</summary>
            <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={runAuthCheck} 
          disabled={checking}
        >
          {checking ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Vérification...
            </>
          ) : (
            'Vérifier l\'authentification'
          )}
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={refreshSession} 
          disabled={checking || !isAuthenticated}
        >
          Rafraîchir session
        </Button>
      </div>
    </div>
  );
};

export default AuthDebugger;
