
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthChangeEvent } from '@supabase/supabase-js';

interface SupabaseErrorHandlerProps {
  children: React.ReactNode;
}

// Liste des erreurs connues qui peuvent être gérées automatiquement
const knownErrors = {
  'JWT expired': 'Votre session a expiré',
  'Invalid JWT': 'Problème d\'authentification', // Fixed apostrophe
  'Invalid refresh token': 'Votre session n\'est plus valide',
  'Network request failed': 'Problème de connexion au serveur',
  'Failed to fetch': 'Problème de connexion réseau'
};

export function SupabaseErrorHandler({ children }: SupabaseErrorHandlerProps) {
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const authListener = useRef<any>(null);

  // Détecter les problèmes de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connexion internet rétablie');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Connexion internet perdue', {
        description: 'Certaines fonctionnalités peuvent être limitées'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Écouter les événements d'authentification
  useEffect(() => {
    authListener.current = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      console.log('Auth state change:', event);

      const isAuthPage = location.pathname.includes('/auth');

      if (event === 'SIGNED_OUT') {
        if (!isAuthPage) {
          toast.info('Vous avez été déconnecté');
          navigate('/auth');
        }
      }

      // Handle user deletion with proper type checking
      if (event === 'USER_DELETED' as AuthChangeEvent) {
        toast.error('Votre compte a été supprimé', {
          description: 'Veuillez contacter le support si vous pensez qu\'il s\'agit d\'une erreur.'
        });
        navigate('/auth');
      }

      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }

      if (event === 'PASSWORD_RECOVERY') {
        uiToast({
          title: 'Réinitialisation de mot de passe',
          description: 'Suivez les instructions pour créer un nouveau mot de passe'
        });
      }
    });

    return () => {
      if (authListener.current) {
        authListener.current.subscription.unsubscribe();
      }
    };
  }, [navigate, location, uiToast]);

  // Intercepter les erreurs globales
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      
      // Analyser l'erreur pour voir si elle est liée à Supabase
      const errorMessage = event.error?.message || event.message;
      
      // Vérifier si c'est une erreur connue
      for (const [errorPattern, userMessage] of Object.entries(knownErrors)) {
        if (errorMessage.includes(errorPattern)) {
          toast.error(userMessage, {
            description: 'L\'application va tenter de résoudre ce problème automatiquement.'
          });
          
          // Tenter de résoudre automatiquement
          if (errorPattern.includes('JWT') || errorPattern.includes('token')) {
            // Problème d'authentification
            console.log('Attempting to refresh session...');
            supabase.auth.refreshSession();
          }
          
          event.preventDefault();
          return;
        }
      }
    };

    window.addEventListener('error', handleGlobalError);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  return <>{children}</>;
}
