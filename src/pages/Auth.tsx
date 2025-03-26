
import React, { useEffect, useState } from 'react';
import { AuthForm } from '@/components/ui/auth/AuthForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const { isAuthenticated } = useAuthContext();
  
  // Récupérer la destination de redirection depuis les query params
  const getReturnPath = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('returnTo') || '/';
  };

  // Check if the user is coming from a verification email
  useEffect(() => {
    const checkEmailVerification = async () => {
      const params = new URLSearchParams(location.hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      
      if (accessToken && refreshToken && type === 'recovery') {
        // Handle password reset flow
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (!error) {
          navigate('/settings?tab=security');
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
            setVerifyingEmail(false);
            navigate(getReturnPath());
          }
        } catch (error) {
          console.error('Email verification error:', error);
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
