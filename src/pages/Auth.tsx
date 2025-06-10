
import React, { useEffect, useState } from 'react';
import { AuthForm } from '@/components/ui/auth/AuthForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthContext();
  
  // Get return path from query params or default to dashboard
  const getReturnPath = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('returnTo') || '/dashboard';
  };

  // Si l'authentification nécessite une redirection vers la page de callback, 
  // on la laisse se faire gérer par cette page et on ne fait rien ici
  useEffect(() => {
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
  }, [isAuthenticated, navigate, location.hash, location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg">
          Chargement...
        </p>
      </div>
    );
  }

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
