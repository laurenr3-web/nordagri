
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { checkRateLimit, sanitizeInput, logSecurityEvent } from '@/utils/secureAuthUtils';

export function useSecureAuthHandlers() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Log security event
      logSecurityEvent('user_logout_initiated');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear any client-side sensitive data
      localStorage.removeItem('lastFarmAccess');
      sessionStorage.clear();
      
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté avec succès',
      });
      
      logSecurityEvent('user_logout_completed');
      navigate('/auth', { replace: true });
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      logSecurityEvent('user_logout_failed', { error: error.message });
      
      toast({
        title: 'Erreur de déconnexion',
        description: error.message || 'Une erreur est survenue lors de la déconnexion',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const secureSignIn = async (email: string, password: string) => {
    const clientId = `${navigator.userAgent}_${email}`;
    
    // Check rate limiting
    const rateCheck = checkRateLimit(`login_${clientId}`, 5, 15 * 60 * 1000);
    
    if (!rateCheck.allowed) {
      toast({
        title: 'Trop de tentatives',
        description: rateCheck.message || 'Veuillez réessayer plus tard',
        variant: 'destructive',
      });
      logSecurityEvent('login_rate_limit_exceeded', { email, clientId });
      return;
    }

    try {
      setLoading(true);
      
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      const sanitizedPassword = password; // Don't sanitize password as it might remove valid characters
      
      // Basic validation
      if (!sanitizedEmail || !sanitizedPassword) {
        throw new Error('Email et mot de passe requis');
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
        throw new Error('Format d\'email invalide');
      }

      logSecurityEvent('login_attempt_started', { email: sanitizedEmail });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword
      });

      if (error) {
        logSecurityEvent('login_attempt_failed', { 
          email: sanitizedEmail, 
          error: error.message,
          remaining: rateCheck.remaining 
        });
        throw error;
      }

      if (!data.session) {
        throw new Error('Session non créée');
      }

      logSecurityEvent('login_attempt_succeeded', { 
        email: sanitizedEmail,
        userId: data.user?.id 
      });

      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue !',
      });

    } catch (error: any) {
      console.error('Erreur d\'authentification sécurisée:', error);
      
      let errorMessage = 'Échec de l\'authentification';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Veuillez confirmer votre email avant de vous connecter';
      }
      
      toast({
        title: 'Erreur de connexion',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    signOut,
    secureSignIn,
    loading
  };
}
