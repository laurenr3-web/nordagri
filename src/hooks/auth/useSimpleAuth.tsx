
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface ProfileData {
  id: string;
  first_name?: string;
  last_name?: string;
  farm_id?: string;
}

export interface SimpleAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profileData: ProfileData | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

export function useSimpleAuth(): SimpleAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const navigate = useNavigate();

  const isAuthenticated = Boolean(user && session);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfileData(null);
      toast.success('Déconnexion réussie');
      navigate('/auth');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors du chargement du profil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Vérifier la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
        } else {
          setSession(currentSession);
          setUser(currentSession?.user || null);
          
          if (currentSession?.user) {
            const profile = await fetchProfile(currentSession.user.id);
            if (isMounted && profile) {
              setProfileData(profile);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state change:', event);
        
        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user && event === 'SIGNED_IN') {
          const profile = await fetchProfile(currentSession.user.id);
          if (isMounted && profile) {
            setProfileData(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfileData(null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading,
    profileData,
    isAuthenticated,
    signOut,
  };
}
