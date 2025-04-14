
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { getSupabaseErrorMessage } from '@/utils/errorHandling';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface SupabaseErrorHandlerProps {
  children: React.ReactNode;
}

export const SupabaseErrorHandler: React.FC<SupabaseErrorHandlerProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [showAuthError, setShowAuthError] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Détecter les problèmes de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsDisconnected(false);
      toast.success('Connexion rétablie', {
        description: 'Synchronisation des données en cours...'
      });
      
      // Rafraîchir les données après reconnexion
      window.location.reload();
    };
    
    const handleOffline = () => {
      setIsDisconnected(true);
      toast.warning('Connexion internet perdue', {
        description: 'Certaines fonctionnalités peuvent être limitées'
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Vérifier l'état de la connexion au démarrage
    setIsDisconnected(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Intercepter les erreurs d'authentification
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        console.log('Auth event detected:', event);
        if (!session && window.location.pathname !== '/auth') {
          setShowAuthError(true);
        }
      }
      
      if (event === 'SIGNED_IN') {
        setShowAuthError(false);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);
  
  // Observer les erreurs globales de Supabase
  useEffect(() => {
    const handleErrorEvent = (event: ErrorEvent) => {
      const error = event.error || event.message;
      
      // Ne capturer que les erreurs liées à Supabase
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error.message as string;
        
        if (
          errorMessage.includes('supabase') || 
          errorMessage.includes('auth/') || 
          errorMessage.includes('network') ||
          errorMessage.includes('401') ||
          errorMessage.includes('authentication')
        ) {
          setLastError(error as Error);
          
          // Notifier l'utilisateur de l'erreur
          toast.error('Erreur de communication avec le serveur', {
            description: getSupabaseErrorMessage(error),
            action: {
              label: 'Réessayer',
              onClick: () => window.location.reload()
            }
          });
          
          // Si c'est une erreur d'authentification
          if (
            errorMessage.includes('401') || 
            errorMessage.includes('auth/') ||
            errorMessage.includes('expired')
          ) {
            setShowAuthError(true);
          }
        }
      }
    };
    
    window.addEventListener('error', handleErrorEvent);
    
    return () => {
      window.removeEventListener('error', handleErrorEvent);
    };
  }, [navigate]);
  
  const handleReconnect = () => {
    window.location.reload();
  };
  
  const handleLogin = () => {
    navigate('/auth');
    setShowAuthError(false);
  };
  
  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        toast.error('Erreur lors du rafraîchissement de la session', {
          description: getSupabaseErrorMessage(error)
        });
      } else if (data.session) {
        toast.success('Session rafraîchie avec succès');
        setShowAuthError(false);
      } else {
        toast.warning('Connexion requise', {
          description: 'Veuillez vous reconnecter pour continuer'
        });
        navigate('/auth');
      }
    } catch (error) {
      console.error('Exception during session refresh:', error);
      toast.error('Erreur lors du rafraîchissement de la session');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <>
      {isDisconnected && (
        <Alert variant="destructive" className="fixed bottom-4 right-4 max-w-md z-50 shadow-lg">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Connexion Internet perdue</AlertTitle>
          <AlertDescription>
            <p className="mb-2">Vous êtes actuellement en mode hors ligne. Certaines fonctionnalités peuvent être limitées.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReconnect}
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Reconnecter
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <Dialog open={showAuthError} onOpenChange={setShowAuthError}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Session expirée</DialogTitle>
            <DialogDescription>
              Votre session a expiré ou vous avez été déconnecté. Veuillez vous reconnecter pour continuer.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={handleRefreshSession}
              disabled={isRefreshing}
              className="w-full sm:w-auto"
            >
              {isRefreshing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {!isRefreshing && <RefreshCw className="mr-2 h-4 w-4" />}
              Rafraîchir la session
            </Button>
            
            <Button 
              onClick={handleLogin}
              className="w-full sm:w-auto"
            >
              Se connecter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {children}
    </>
  );
};
