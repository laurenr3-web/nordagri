
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { withPreviewToken } from '@/utils/previewRouting';
import { consumeAuthRedirectTarget } from '@/utils/authRedirect';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [processingAuth, setProcessingAuth] = useState(true);

  const getPostAuthTarget = (type: string | null): string => {
    // Check for stored invitation/redirect target first
    const stored = consumeAuthRedirectTarget();
    if (stored) return stored;

    // Legacy
    const pending = localStorage.getItem('pendingInvitation');
    if (pending) {
      localStorage.removeItem('pendingInvitation');
      return `/accept-invitation?id=${pending}`;
    }

    if (type === 'recovery') return '/settings?tab=security';
    return '/dashboard';
  };

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        setProcessingAuth(true);
        const url = window.location.href;
        
        if (url.includes('#')) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');
          const hashError = hashParams.get('error');
          const errorCode = hashParams.get('error_code');
          const errorDescription = hashParams.get('error_description');

          if (hashError) {
            if (errorCode === 'otp_expired') {
              setError("Le lien de vérification a expiré. Veuillez demander un nouveau lien.");
              toast.error("Le lien de vérification a expiré.");
            } else {
              setError(`Erreur: ${errorDescription || hashError}`);
              toast.error(`Erreur: ${errorDescription || hashError}`);
            }
            setTimeout(() => navigate(withPreviewToken('/auth'), { replace: true }), 3000);
            return;
          }
          
          if (accessToken && refreshToken) {
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (sessionError) {
              console.error('Session verification error:', sessionError);
              setError("Erreur lors de la vérification de votre session: " + sessionError.message);
              setTimeout(() => navigate(withPreviewToken('/auth'), { replace: true }), 3000);
              return;
            }
            
            if (data.session) {
              const target = getPostAuthTarget(type);

              if (type === 'recovery') {
                toast.success("Vous pouvez maintenant définir votre nouveau mot de passe");
              } else if (type === 'signup' || type === 'magiclink') {
                toast.success("Email vérifié avec succès! Vous êtes maintenant connecté.");
              } else {
                toast.success("Authentification réussie!");
              }

              // Use full page reload for invitation targets to refresh profile context
              if (target.includes('accept-invitation')) {
                window.location.href = target;
              } else {
                navigate(withPreviewToken(target), { replace: true });
              }
              return;
            }
          }
        }

        setError("Paramètres d'authentification manquants ou invalides");
        setTimeout(() => navigate(withPreviewToken('/auth'), { replace: true }), 3000);
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError("Une erreur est survenue: " + err.message);
        setTimeout(() => navigate(withPreviewToken('/auth'), { replace: true }), 3000);
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
