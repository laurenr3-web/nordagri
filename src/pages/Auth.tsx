
import React, { useEffect, useState } from 'react';
import { AuthForm } from '@/components/ui/auth/AuthForm';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const { isAuthenticated } = useAuthContext();
  
  // Récupérer la destination de redirection depuis les query params
  const getReturnPath = () => {
    // Priorité au paramètre redirectTo
    const redirectTo = searchParams.get('redirectTo');
    if (redirectTo) return redirectTo;
    
    // Ensuite vérifier returnTo pour rétrocompatibilité
    const returnTo = searchParams.get('returnTo');
    if (returnTo) return returnTo;
    
    // Par défaut, rediriger vers l'accueil
    return '/';
  };

  // Check if the user is coming from a verification email
  useEffect(() => {
    const checkEmailVerification = async () => {
      // Vérifier s'il y a des paramètres de hash dans l'URL
      if (!location.hash) return;
      
      const params = new URLSearchParams(location.hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      
      if (!accessToken) return;
      
      if (accessToken && refreshToken && type === 'recovery') {
        toast.info('Réinitialisation du mot de passe', {
          description: 'Veuillez définir votre nouveau mot de passe'
        });
        
        // Handle password reset flow
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (!error) {
          navigate('/settings?tab=security');
        } else {
          toast.error('Erreur lors de la réinitialisation', {
            description: error.message || 'Lien expiré ou invalide'
          });
        }
      } else if (accessToken && type === 'signup') {
        setVerifyingEmail(true);
        // Handle email verification for signup
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (!error) {
            // User has verified their email and is now logged in
            toast.success('Email vérifié avec succès', {
              description: 'Votre compte est maintenant actif'
            });
            setVerifyingEmail(false);
            navigate(getReturnPath());
          } else {
            throw error;
          }
        } catch (error: any) {
          console.error('Email verification error:', error);
          toast.error('Erreur de vérification', {
            description: error.message || 'Impossible de vérifier votre email'
          });
          setVerifyingEmail(false);
        }
      }
    };
    
    checkEmailVerification();
  }, [location, navigate]);

  useEffect(() => {
    // Si l'utilisateur est déjà authentifié, rediriger vers la page de retour
    if (isAuthenticated) {
      navigate(getReturnPath());
    }
    setLoading(false);
  }, [isAuthenticated, navigate]);

  if (loading || verifyingEmail) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg">
          {verifyingEmail ? 'Vérification de votre email...' : 'Chargement...'}
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
      <AuthForm onSuccess={() => navigate(getReturnPath())} />
    </div>
  );
};

export default Auth;
