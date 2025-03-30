
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

/**
 * Hook personnalisé pour gérer l'authentification
 * @param requireAuth Indique si l'authentification est requise pour accéder à cette route
 * @param redirectTo Chemin de redirection si l'authentification échoue
 */
export function useAuth(requireAuth = false, redirectTo = '/auth') {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    // Fonction asynchrone pour obtenir la session
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          if (requireAuth) {
            navigate(redirectTo);
          }
          setLoading(false);
          return;
        }

        setSession(data.session);
        setUser(data.session?.user || null);

        // Obtenir les données du profil si l'utilisateur est connecté
        if (data.session?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Erreur lors de la récupération du profil:', profileError);
          } else {
            setProfileData(profileData);
          }
        }

        // Vérifier si l'authentification est requise mais l'utilisateur n'est pas connecté
        if (requireAuth && !data.session) {
          navigate(redirectTo);
        }

        setLoading(false);
      } catch (error) {
        console.error('Erreur inattendue lors de la récupération de la session:', error);
        setLoading(false);
        if (requireAuth) {
          navigate(redirectTo);
        }
      }
    };

    // S'abonner aux changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Événement d\'authentification:', event);
        setSession(newSession);
        setUser(newSession?.user || null);

        // Vérifier si l'authentification est requise mais l'utilisateur n'est pas connecté
        if (requireAuth && !newSession) {
          navigate(redirectTo);
        }
      }
    );

    // Obtenir la session initiale
    getSession();

    // Nettoyer l'écouteur d'événements lors du démontage
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [requireAuth, redirectTo, navigate]);

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
        return;
      }
      // La redirection sera gérée par l'écouteur onAuthStateChange
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error);
    }
  };

  return {
    user,
    session,
    loading,
    profileData,
    isAuthenticated: !!user,
    signOut,
  };
}

export default useAuth;
