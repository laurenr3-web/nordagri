
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Composant de callback pour gérer la redirection après confirmation d'email
 * ou réinitialisation de mot de passe via Supabase
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [processingAuth, setProcessingAuth] = useState(true);

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        setProcessingAuth(true);

        const url = window.location.href;
        
        // On vérifie si on a un hash contenant des tokens
        if (url.includes('#')) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');
          const error = hashParams.get('error');
          const errorCode = hashParams.get('error_code');
          const errorDescription = hashParams.get('error_description');

          // Log limité pour débogage en dev uniquement
          if (import.meta.env.DEV) {
            console.log('Auth callback params:', { 
              hasHash: true, 
              type, 
              hasAccessToken: !!accessToken,
              hasRefreshToken: !!refreshToken,
              error,
              errorCode,
              errorDescription
            });
          }

          // Gérer les erreurs dans les paramètres
          if (error) {
            if (errorCode === 'otp_expired') {
              setError("Le lien de vérification a expiré. Veuillez demander un nouveau lien.");
              toast.error("Le lien de vérification a expiré. Veuillez demander un nouveau lien.");
              setTimeout(() => navigate('/auth'), 3000);
              return;
            } else {
              setError(`Erreur: ${errorDescription || error}`);
              toast.error(`Erreur: ${errorDescription || error}`);
              setTimeout(() => navigate('/auth'), 3000);
              return;
            }
          }
          
          // Si nous avons un token valide, configurer la session
          if (accessToken && refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('Session verification error:', error);
              setError("Erreur lors de la vérification de votre session: " + error.message);
              toast.error("Erreur lors de la vérification de votre session: " + error.message);
              setTimeout(() => navigate('/auth'), 3000);
              return;
            }
            
            if (data.session) {
              // Récupérer le profil utilisateur si besoin
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.session.user.id)
                .single();
                
              if (type === 'recovery') {
                // Redirection vers la page de changement de mot de passe
                toast.success("Vous pouvez maintenant définir votre nouveau mot de passe");
                navigate('/settings?tab=security', { replace: true });
              } else if (type === 'signup' || type === 'magiclink') {
                // L'utilisateur a vérifié son email et est maintenant connecté
                toast.success("Email vérifié avec succès! Vous êtes maintenant connecté.");
                navigate('/dashboard', { replace: true });
              } else {
                // Autre type de confirmation, rediriger vers le dashboard
                toast.success("Authentification réussie!");
                navigate('/dashboard', { replace: true });
              }
              return;
            }
          }
        }

        // Si on arrive ici, c'est qu'on n'a pas pu traiter les paramètres d'authentification
        setError("Paramètres d'authentification manquants ou invalides");
        setTimeout(() => navigate('/auth'), 3000);
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setError("Une erreur est survenue: " + error.message);
        setTimeout(() => navigate('/auth'), 3000);
      } finally {
        setProcessingAuth(false);
      }
    }
    
    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen flex-col gap-4 p-4">
      <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          {processingAuth ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Authentification en cours</h2>
              <p className="text-muted-foreground">
                Veuillez patienter pendant que nous vérifions votre identité...
              </p>
            </>
          ) : error ? (
            <>
              <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-4">
                <p>{error}</p>
              </div>
              <p className="text-muted-foreground">
                Vous serez redirigé vers la page de connexion dans quelques instants.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2">Connexion réussie!</h2>
              <p className="text-muted-foreground">
                Vous êtes maintenant connecté et serez redirigé dans quelques instants.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
