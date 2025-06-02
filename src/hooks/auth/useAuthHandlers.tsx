
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { productionConfig } from '@/config/productionConfig';

/**
 * Hook providing authentication handlers (signOut) optimized for nordagri.ca
 */
export function useAuthHandlers() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * Function to sign out the user with enhanced error handling
   */
  const signOut = async () => {
    let attempts = 0;
    const maxAttempts = productionConfig.retryAttempts;
    
    while (attempts < maxAttempts) {
      try {
        setLoading(true);
        
        console.log(`Tentative de déconnexion ${attempts + 1}/${maxAttempts} sur ${productionConfig.currentDomain}`);
        
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          throw error;
        }
        
        console.log('Déconnexion réussie');
        toast({
          title: 'Déconnexion réussie',
          description: 'Vous avez été déconnecté avec succès',
        });
        
        // Redirection vers la page d'authentification
        navigate('/auth', { replace: true });
        return; // Succès, sortir de la boucle
        
      } catch (error: any) {
        attempts++;
        console.error(`Erreur lors de la déconnexion (tentative ${attempts}/${maxAttempts}):`, error);
        
        if (attempts < maxAttempts) {
          // Attendre avant de réessayer
          await new Promise(resolve => setTimeout(resolve, productionConfig.authRetryDelay));
        } else {
          // Dernière tentative échouée
          toast({
            title: 'Erreur de déconnexion',
            description: productionConfig.currentDomain === 'nordagri.ca' 
              ? 'Problème de connexion. Veuillez réessayer ou contacter le support.'
              : error.message || 'Une erreur est survenue lors de la déconnexion',
            variant: 'destructive',
          });
          
          // En cas d'échec total sur nordagri.ca, forcer la redirection
          if (productionConfig.currentDomain === 'nordagri.ca') {
            console.warn('Forçage de la redirection après échec de déconnexion');
            navigate('/auth', { replace: true });
          }
        }
      } finally {
        if (attempts >= maxAttempts) {
          setLoading(false);
        }
      }
    }
  };

  return {
    signOut,
    loading
  };
}
