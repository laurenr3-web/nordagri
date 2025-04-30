
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

export const useAuthHandlers = (onSuccess?: () => void) => {
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [resetSent, setResetSent] = useState(false);
  
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
      console.error('Erreur de réinitialisation:', error);
      toast.error(error.message || "Impossible d'envoyer l'email de réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    if (loginAttempts >= 5) {
      toast.error('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
      return;
    }
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setLoginAttempts(prev => prev + 1);
        throw error;
      }
      
      // Log successful login
      const timestamp = new Date().toISOString();
      console.log(`Connexion réussie: ${timestamp}`);
      
      toast.success('Connexion réussie');
      setLoginAttempts(0);
      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur d\'authentification:', error);
      toast.error(error.message || 'Échec de l\'authentification');
    }
  };

  const handleSignup = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ) => {
    try {
      // First register the user
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          // Utilisez l'URL complète de l'application pour la redirection
          // Assurez-vous d'utiliser l'URL de votre application, pas l'URL Supabase
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });
      
      if (signUpError) throw signUpError;
      
      toast.success('Compte créé! Veuillez vérifier votre email pour confirmer votre compte.');
      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      toast.error(error.message || 'L\'inscription a échoué');
    }
  };
  
  return {
    loading,
    setLoading,
    loginAttempts,
    resetSent,
    handlePasswordReset,
    handleLogin,
    handleSignup
  };
};
