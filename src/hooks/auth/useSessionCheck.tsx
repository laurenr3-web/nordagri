
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { productionConfig } from '@/config/productionConfig';
import type { User, Session } from '@supabase/supabase-js';
import type { ProfileData } from './useAuthState';

/**
 * Hook to check session on mount with enhanced error handling for nordagri.ca
 */
export function useSessionCheck(
  setUser: (user: User | null) => void,
  setSession: (session: Session | null) => void,
  setProfileData: (profileData: ProfileData | null) => void,
  setLoading: (loading: boolean) => void,
  requireAuth: boolean,
  redirectTo?: string
) {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      let attempts = 0;
      const maxAttempts = productionConfig.retryAttempts;
      
      while (attempts < maxAttempts && mounted) {
        try {
          console.log(`Vérification session ${attempts + 1}/${maxAttempts} sur ${productionConfig.currentDomain}`);
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          if (!mounted) return;
          
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
              
              if (mounted && profile) {
                setProfileData(profile);
              }
            } catch (profileError) {
              console.warn('Erreur récupération profil:', profileError);
            }
          } else {
            setUser(null);
            setSession(null);
            setProfileData(null);
            
            if (requireAuth && !window.location.pathname.includes('/auth')) {
              const redirectPath = redirectTo || window.location.pathname;
              navigate(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
            }
          }
          
          setLoading(false);
          return; // Succès, sortir de la boucle
          
        } catch (error) {
          attempts++;
          console.error(`Erreur vérification session (tentative ${attempts}/${maxAttempts}):`, error);
          
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, productionConfig.authRetryDelay));
          } else {
            console.error('Échec total de vérification de session');
            if (mounted) {
              setLoading(false);
              if (requireAuth) {
                navigate('/auth?error=session_check_failed');
              }
            }
          }
        }
      }
    };

    checkSession();
    
    return () => {
      mounted = false;
    };
  }, [setUser, setSession, setProfileData, setLoading, requireAuth, redirectTo, navigate]);
}
