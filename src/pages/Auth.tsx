
import React, { useEffect, useState } from 'react';
import { AuthForm } from '@/components/ui/auth/AuthForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, checkSupabaseConnection } from "@/integrations/supabase/client";
import { Loader2, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [connectionRetries, setConnectionRetries] = useState(0);
  const { isAuthenticated } = useAuthContext();
  
  // Get return path from query params or default to dashboard
  const getReturnPath = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('returnTo') || '/dashboard';
  };

  // Vérifier l'état de la connexion à Supabase
  const checkConnection = async () => {
    try {
      const isConnected = await checkSupabaseConnection();
      setConnectionError(!isConnected);
      return isConnected;
    } catch (error) {
      console.error("Erreur lors de la vérification de la connexion:", error);
      setConnectionError(true);
      return false;
    }
  };

  // Fonction pour réessayer la connexion
  const retryConnection = async () => {
    setLoading(true);
    setConnectionRetries(prev => prev + 1);
    
    const isConnected = await checkConnection();
    
    if (isConnected) {
      toast.success("Connexion rétablie");
      setLoading(false);
    } else {
      setLoading(false);
      toast.error("La connexion n'a pas pu être rétablie");
    }
  };
  
  // Vérifier l'authentification et la connexion au chargement
  useEffect(() => {
    const initAuth = async () => {
      // Vérifier d'abord la connexion à Supabase
      const isConnected = await checkConnection();
      
      if (!isConnected) {
        setLoading(false);
        return;
      }
      
      // Vérifier si l'utilisateur est déjà authentifié
      if (isAuthenticated) {
        const returnPath = getReturnPath();
        navigate(returnPath, { replace: true });
      }
      
      // Si nous avons un hash (confirmation d'email, reset mot de passe)
      // et que nous ne sommes pas sur /auth/callback, on redirige
      if (location.hash && location.pathname === '/auth') {
        navigate('/auth/callback' + location.hash, { replace: true });
        return;
      }
      
      setLoading(false);
    };
    
    initAuth();
  }, [isAuthenticated, navigate, location.hash, location.pathname]);

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg">
          Chargement...
        </p>
      </div>
    );
  }

  // Afficher un message d'erreur de connexion
  if (connectionError) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-6 p-4">
        <Alert variant="destructive" className="max-w-md w-full">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Problème de connexion au serveur</AlertTitle>
          <AlertDescription>
            Impossible de se connecter au serveur d'authentification. Cela peut être dû à:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Un problème de réseau</li>
              <li>Une configuration incorrecte du domaine</li>
              <li>Une maintenance du serveur</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col items-center gap-3">
          <WifiOff className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-medium">Service d'authentification indisponible</h2>
          <p className="text-center text-muted-foreground">
            Nous ne pouvons pas vous connecter pour le moment car le service d'authentification est inaccessible.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button 
            onClick={retryConnection}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Réessayer la connexion
          </Button>
          
          {connectionRetries > 2 && (
            <p className="text-sm text-muted-foreground mt-4">
              Vous avez fait plusieurs tentatives sans succès. Si le problème persiste, veuillez vérifier votre:
              <br />
              - Configuration DNS<br />
              - Configuration Supabase pour votre domaine<br />
              - Paramètres des variables d'environnement
            </p>
          )}
        </div>
      </div>
    );
  }

  // Afficher le formulaire d'authentification
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">OptiTractor</h1>
        <p className="text-muted-foreground">Système de gestion d'équipement agricole</p>
      </div>
      <AuthForm 
        onSuccess={() => {
          const returnPath = getReturnPath();
          navigate(returnPath);
        }} 
      />
    </div>
  );
};

export default Auth;
