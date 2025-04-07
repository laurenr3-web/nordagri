
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

export const useAuthHandlers = (onSuccess?: () => void) => {
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [resetSent, setResetSent] = useState(false);
  
  // Vérifier si le compte est verrouillé
  const isAccountLocked = () => {
    if (lockoutUntil && new Date() < lockoutUntil) {
      const minutesRemaining = Math.ceil((lockoutUntil.getTime() - new Date().getTime()) / 60000);
      toast.error(`Compte temporairement verrouillé`, {
        description: `Veuillez réessayer dans ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`
      });
      return true;
    }
    return false;
  };
  
  const handlePasswordReset = async (e: React.FormEvent, email: string, emailRegex: RegExp, setFormErrors: (errors: any) => void) => {
    e.preventDefault();
    
    if (!email || !emailRegex.test(email)) {
      setFormErrors({ email: "Veuillez entrer une adresse email valide" });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) throw error;
      
      setResetSent(true);
      toast.success('Instructions de réinitialisation envoyées à votre email');
    } catch (error: any) {
      console.error('Erreur de réinitialisation du mot de passe:', error);
      
      // Messages d'erreur plus détaillés
      if (error.message.includes('User not found')) {
        toast.error('Adresse email non trouvée', {
          description: 'Aucun compte n\'est associé à cette adresse email'
        });
      } else {
        toast.error('Échec d\'envoi de l\'email de réinitialisation', {
          description: error.message || 'Veuillez réessayer ultérieurement'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    if (isAccountLocked()) return;
    
    if (loginAttempts >= 5) {
      // Verrouillage temporaire de 15 minutes
      const lockoutTime = new Date();
      lockoutTime.setMinutes(lockoutTime.getMinutes() + 15);
      setLockoutUntil(lockoutTime);
      
      toast.error('Trop de tentatives de connexion', {
        description: 'Compte temporairement verrouillé. Veuillez réessayer dans 15 minutes ou réinitialiser votre mot de passe.'
      });
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setLoginAttempts(prev => prev + 1);
        
        // Messages d'erreur plus détaillés
        if (error.message.includes('Invalid login')) {
          throw new Error('Identifiants incorrects. Vérifiez votre email et mot de passe.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Email non confirmé. Veuillez vérifier votre boîte de réception.');
        } else {
          throw error;
        }
      }
      
      // Journalisation de connexion réussie avec plus d'informations
      const timestamp = new Date().toISOString();
      console.log(`Connexion réussie: ${timestamp}, Email: ${email}, IP: [masqué]`);
      
      toast.success('Connexion réussie');
      setLoginAttempts(0);
      setLockoutUntil(null);
      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur d\'authentification:', error);
      toast.error('Échec de la connexion', {
        description: error.message || 'Vérifiez vos identifiants et réessayez'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ) => {
    try {
      setLoading(true);
      // First register the user
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth?verification=true`,
        }
      });
      
      if (signUpError) {
        // Messages d'erreur plus détaillés
        if (signUpError.message.includes('User already registered')) {
          throw new Error('Cette adresse email est déjà utilisée par un compte existant.');
        } else {
          throw signUpError;
        }
      }
      
      toast.success('Compte créé ! Veuillez vérifier votre email pour confirmer votre compte.');
      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      toast.error('Échec de l\'inscription', {
        description: error.message || 'Une erreur est survenue lors de la création du compte'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    setLoading,
    loginAttempts,
    lockoutUntil,
    resetSent,
    handlePasswordReset,
    handleLogin,
    handleSignup
  };
};
