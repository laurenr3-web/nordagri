
import React, { useEffect } from 'react';
import { AuthForm } from '@/components/ui/auth/AuthForm';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuthContext();
  
  // Extract returnTo parameter from URL if present
  const params = new URLSearchParams(location.search);
  const returnTo = params.get('returnTo') || '/dashboard';
  
  useEffect(() => {
    // If already authenticated, redirect to dashboard or returnTo path
    if (isAuthenticated && !loading) {
      toast.success('Vous êtes déjà connecté');
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, returnTo]);
  
  const handleAuthSuccess = () => {
    navigate(returnTo, { replace: true });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <div className="w-full max-w-md text-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">OptiTractor</h1>
          <p className="text-muted-foreground mt-2">Plateforme de gestion des équipements agricoles</p>
        </div>
        
        <Card className="border-t-4 border-t-primary">
          <CardContent className="pt-6">
            <AuthForm onSuccess={handleAuthSuccess} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
