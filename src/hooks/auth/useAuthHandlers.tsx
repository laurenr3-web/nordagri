
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook providing authentication handlers (signOut)
 */
export function useAuthHandlers() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * Function to sign out the user
   */
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
      
      // Redirection vers la page d'authentification
      navigate('/auth', { replace: true });
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

  return {
    signOut,
    loading
  };
}
