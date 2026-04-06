
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { setAuthRedirectTarget } from '@/utils/authRedirect';
import { withPreviewToken } from '@/utils/previewRouting';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const invitationId = searchParams.get('id');
  
  const [status, setStatus] = useState<'loading' | 'accepting' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Wait for auth to finish loading before making decisions
    if (authLoading) return;

    if (!invitationId) {
      setStatus('error');
      setErrorMessage("Lien d'invitation invalide");
      return;
    }

    if (!isAuthenticated) {
      // Store the full path so we come back here after login/signup
      setAuthRedirectTarget(`/accept-invitation?id=${invitationId}`);
      navigate(withPreviewToken(`/auth?returnTo=${encodeURIComponent(`/accept-invitation?id=${invitationId}`)}`), { replace: true });
      return;
    }

    // User is authenticated, accept the invitation
    acceptInvitation();
  }, [invitationId, isAuthenticated, authLoading]);

  const acceptInvitation = async () => {
    setStatus('accepting');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        // Session is stale/invalid — redirect to auth
        setAuthRedirectTarget(`/accept-invitation?id=${invitationId}`);
        await supabase.auth.signOut();
        navigate(withPreviewToken('/auth'), { replace: true });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/accept-invitation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ invitationId }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        // If 401 — session is invalid, redirect to auth
        if (response.status === 401) {
          setAuthRedirectTarget(`/accept-invitation?id=${invitationId}`);
          await supabase.auth.signOut();
          toast.error("Session expirée. Veuillez vous reconnecter.");
          navigate(withPreviewToken('/auth'), { replace: true });
          return;
        }

        // Already a member — just go to dashboard
        if (data?.error?.includes('déjà été traitée') || data?.error?.includes('déjà membre')) {
          setStatus('success');
          toast.info("Vous êtes déjà membre de cette ferme");
          localStorage.removeItem('pendingInvitation');
          setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
          return;
        }
        throw new Error(data?.error || "Erreur lors de l'acceptation");
      }

      setStatus('success');
      toast.success(data.message || "Invitation acceptée !");
      localStorage.removeItem('pendingInvitation');
      setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
    } catch (err: any) {
      console.error("Erreur acceptation:", err);
      setStatus('error');
      setErrorMessage(err.message || "Une erreur est survenue");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {status === 'loading' || status === 'accepting' ? (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
              <CardTitle>Traitement en cours...</CardTitle>
              <CardDescription>Nous validons votre invitation</CardDescription>
            </>
          ) : status === 'success' ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-green-700">Bienvenue dans la ferme !</CardTitle>
              <CardDescription>Redirection vers le tableau de bord...</CardDescription>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-red-700">Erreur</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </>
          )}
        </CardHeader>
        {status === 'error' && (
          <CardContent className="flex flex-col items-center gap-3">
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Retour au tableau de bord
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AcceptInvitation;
