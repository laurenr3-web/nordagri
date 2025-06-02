
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { productionConfig } from '@/config/productionConfig';
import type { User, Session } from '@supabase/supabase-js';
import type { ProfileData } from './useAuthState';

/**
 * Hook to listen for auth state changes with enhanced logging for nordagri.ca
 */
export function useAuthListener(
  setUser: (user: User | null) => void,
  setSession: (session: Session | null) => void,
  setProfileData: (profileData: ProfileData | null) => void,
  requireAuth: boolean,
  redirectTo?: string
) {
  const navigate = useNavigate();

  useEffect(() => {
    console.log(`🔐 Initialisation listener auth sur ${productionConfig.currentDomain}`);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔐 Auth event: ${event}`, { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          domain: productionConfig.currentDomain 
        });
        
        try {
          if (session?.user) {
            setUser(session.user);
            setSession(session);
            
            // Récupérer le profil utilisateur
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (profile) {
                setProfileData(profile);
              }
            } catch (profileError) {
              console.warn('Erreur récupération profil lors du changement d\'état:', profileError);
            }
            
            // Gestion de la redirection après connexion
            if (event === 'SIGNED_IN') {
              const urlParams = new URLSearchParams(window.location.search);
              const redirectPath = urlParams.get('redirect') || redirectTo || '/dashboard';
              navigate(redirectPath, { replace: true });
            }
          } else {
            setUser(null);
            setSession(null);
            setProfileData(null);
            
            // Redirection vers auth si requis
            if (event === 'SIGNED_OUT' && requireAuth && !window.location.pathname.includes('/auth')) {
              navigate('/auth', { replace: true });
            }
          }
        } catch (error) {
          console.error('Erreur dans le listener auth:', error);
        }
      }
    );

    return () => {
      console.log(`🔐 Nettoyage listener auth sur ${productionConfig.currentDomain}`);
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setProfileData, requireAuth, redirectTo, navigate]);
}
