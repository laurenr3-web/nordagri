
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook d'authentification pour gérer l'état de l'utilisateur et les redirections
 * @param requireAuth Si true, redirige vers la page d'authentification si l'utilisateur n'est pas connecté
 * @param redirectTo Page de redirection après authentification (défaut: page actuelle)
 */
export function useAuth(requireAuth = true, redirectTo?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Fonction pour récupérer les données du profil
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        return;
      }

      setProfileData(data);
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
    }
  };

  // Fonction pour se déconnecter
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté avec succès',
      });
      
      // La redirection sera gérée par l'effet useEffect qui surveille la session
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: 'Erreur de déconnexion',
        description: error.message || 'Une erreur est survenue lors de la déconnexion',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fonction pour vérifier l'état de la session
    const checkSession = async () => {
      setLoading(true);
      
      try {
        // Récupérer la session actuelle
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // Mettre à jour l'état
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        // Si l'utilisateur est connecté, récupérer ses données de profil
        if (currentSession?.user) {
          // Utilisez setTimeout pour éviter les blocages potentiels
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        }
        
        // Gérer les redirections
        if (requireAuth && !currentSession) {
          // Stocker l'URL actuelle pour rediriger l'utilisateur après connexion
          const returnPath = location.pathname + location.search;
          navigate(`/auth?returnTo=${encodeURIComponent(returnPath)}`, { replace: true });
        } else if (currentSession && location.pathname === '/auth' && redirectTo) {
          // Rediriger depuis la page d'auth vers la destination spécifiée
          navigate(redirectTo, { replace: true });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Vérifier la session immédiatement
    checkSession();
    
    // Configurer l'abonnement aux changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Mise à jour synchrone de l'état
      setSession(session);
      setUser(session?.user ?? null);
      
      // Si l'utilisateur vient de se connecter, récupérer ses données de profil
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        // Utilisez setTimeout pour éviter les blocages potentiels
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
        
        if (redirectTo && location.pathname === '/auth') {
          navigate(redirectTo, { replace: true });
        } else if (requireAuth && !session) {
          // L'utilisateur s'est déconnecté et cette route nécessite une authentification
          const returnPath = location.pathname + location.search;
          navigate(`/auth?returnTo=${encodeURIComponent(returnPath)}`, { replace: true });
        }
      }
    });
    
    // Nettoyer l'abonnement lorsque le composant est démonté
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location, requireAuth, redirectTo]);

  return {
    user,
    session,
    loading,
    profileData,
    isAuthenticated: !!user,
    signOut,
  };
}
