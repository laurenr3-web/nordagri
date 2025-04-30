
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
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const { isAuthenticated } = useAuthContext();
  
  // Get return path from query params or default to dashboard
  const getReturnPath = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('returnTo') || '/dashboard';
  };

  // Check if the user is coming from a verification email
  useEffect(() => {
    const checkEmailVerification = async () => {
      // Vérifier si nous avons des paramètres dans le hash (confirmation email ou reset password)
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      
      // Log parameters for debugging
      console.log('Auth check parameters:', { 
        hasHash: !!location.hash, 
        type, 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken 
      });
      
      if (accessToken) {
        try {
          setVerifyingEmail(true);
          
          // Définir la session avec les tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (error) {
            toast.error("Erreur lors de la vérification de votre session: " + error.message);
            console.error('Session verification error:', error);
          } else {
            if (type === 'recovery') {
              // Redirection vers la page de changement de mot de passe
              toast.success("Vous pouvez maintenant définir votre nouveau mot de passe");
              navigate('/settings?tab=security');
            } else if (type === 'signup') {
              // L'utilisateur a vérifié son email et est maintenant connecté
              toast.success("Email vérifié avec succès! Vous êtes maintenant connecté.");
              navigate('/dashboard');
            } else {
              // Autre type de confirmation, rediriger vers le dashboard
              navigate('/dashboard');
            }
          }
        } catch (error: any) {
          console.error('Email verification error:', error);
          toast.error("Erreur lors de la vérification: " + error.message);
        } finally {
          setVerifyingEmail(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    if (location.hash) {
      checkEmailVerification();
    } else {
      setLoading(false);
    }
  }, [location, navigate]);

  useEffect(() => {
    // If user is already authenticated, redirect to return path or dashboard
    // But don't redirect if we're in the process of verifying email
    if (isAuthenticated && !verifyingEmail && !location.hash) {
      const returnPath = getReturnPath();
      navigate(returnPath, { replace: true });
    }
  }, [isAuthenticated, navigate, verifyingEmail, location.hash]);

  if (loading || verifyingEmail) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4">
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
