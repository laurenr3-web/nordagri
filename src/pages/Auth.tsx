
import React, { useEffect, useState } from 'react';
import { AuthForm } from '@/components/ui/auth/AuthForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { withPreviewToken } from '@/utils/previewRouting';
import { consumeAuthRedirectTarget } from '@/utils/authRedirect';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthContext();
  
  const getReturnPath = () => {
    // 1. Check URL param
    const searchParams = new URLSearchParams(location.search);
    const returnTo = searchParams.get('returnTo');
    if (returnTo) return decodeURIComponent(returnTo);
    
    // 2. Check stored redirect target (from invitation flow)
    const stored = consumeAuthRedirectTarget();
    if (stored) return stored;
    
    // 3. Legacy pendingInvitation
    const pendingInvitation = localStorage.getItem('pendingInvitation');
    if (pendingInvitation) {
      localStorage.removeItem('pendingInvitation');
      return `/accept-invitation?id=${pendingInvitation}`;
    }
    
    return '/dashboard';
  };

  useEffect(() => {
    if (isAuthenticated) {
      const returnPath = getReturnPath();
      navigate(withPreviewToken(returnPath, location.search), { replace: true });
    }
    
    if (location.hash && location.pathname === '/auth') {
      navigate(withPreviewToken('/auth/callback' + location.hash, location.search), { replace: true });
      return;
    }
    
    setLoading(false);
  }, [isAuthenticated, navigate, location.hash, location.pathname]);

  // Check if user is coming from an invitation link
  const searchParams = new URLSearchParams(location.search);
  const isFromInvitation = searchParams.get('returnTo')?.includes('accept-invitation');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Nordagri</h1>
        <p className="text-muted-foreground">Système de gestion d'équipement agricole</p>
      </div>
      {isFromInvitation && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center max-w-md">
          <p className="text-sm text-blue-800">
            🎉 Vous avez été invité à rejoindre une ferme ! Connectez-vous ou créez un compte pour accepter l'invitation.
          </p>
        </div>
      )}
      <AuthForm 
        onSuccess={() => {
          const returnPath = getReturnPath();
          navigate(withPreviewToken(returnPath, location.search));
        }} 
      />
    </div>
  );
};

export default Auth;
