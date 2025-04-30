
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

export const useAuthForm = (onSuccess?: () => void) => {
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [resetSent, setResetSent] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
  }>({});

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Clear general error when changing auth mode
  useEffect(() => {
    setGeneralError(null);
  }, [authMode]);

  // Check for password reset or verification params in URL
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('reset') === 'true') {
      toast.info('Veuillez vérifier votre email pour réinitialiser votre mot de passe');
    }
    if (url.searchParams.get('verification') === 'true') {
      toast.info('Veuillez vérifier votre email pour confirmer votre compte');
    }
  }, []);

  // Form validation
  const validateForm = () => {
    const errors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      firstName?: string;
      lastName?: string;
    } = {};
    let isValid = true;

    // Email validation
    if (!email) {
      errors.email = "L'email est requis";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      errors.email = "Veuillez entrer une adresse email valide";
      isValid = false;
    }

    // Password validation for signup and login
    if (authMode !== 'reset') {
      if (!password) {
        errors.password = "Le mot de passe est requis";
        isValid = false;
      } else if (authMode === 'signup' && password.length < 8) {
        errors.password = "Le mot de passe doit contenir au moins 8 caractères";
        isValid = false;
      }
    }

    // Confirm password validation for signup
    if (authMode === 'signup') {
      if (!firstName) {
        errors.firstName = "Le prénom est requis";
        isValid = false;
      }
      
      if (!lastName) {
        errors.lastName = "Le nom est requis";
        isValid = false;
      }

      if (password !== confirmPassword) {
        errors.confirmPassword = "Les mots de passe ne correspondent pas";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    
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
      setGeneralError(error.message || "Impossible d'envoyer l'email de réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setGeneralError(null);
    
    if (loginAttempts >= 5) {
      setGeneralError('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setLoginAttempts(prev => prev + 1);
        if (error.message.includes('Invalid login credentials')) {
          setGeneralError('Email ou mot de passe incorrect');
        } else {
          setGeneralError(error.message);
        }
        return;
      }
      
      if (!data.session) {
        throw new Error('Session non créée');
      }
      
      // Log successful login
      const timestamp = new Date().toISOString();
      console.log(`Connexion réussie: ${timestamp}`);
      
      toast.success('Connexion réussie');
      setLoginAttempts(0);
      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur d\'authentification:', error);
      setGeneralError(error.message || 'Échec de l\'authentification');
    }
  };

  const handleSignup = async () => {
    setGeneralError(null);
    
    try {
      // First register the user
      const { data, error: signUpError } = await supabase.auth.signUp({
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
        if (signUpError.message.includes('User already registered')) {
          setGeneralError('Un compte avec cet email existe déjà');
        } else {
          setGeneralError(signUpError.message);
        }
        return;
      }
      
      if (data.user && data.session) {
        // If email confirmation is disabled, user can log in immediately
        toast.success('Compte créé avec succès!');
        onSuccess?.();
      } else {
        // If email confirmation is required
        toast.success('Compte créé! Veuillez vérifier votre email pour confirmer votre compte.');
        setAuthMode('login');
      }
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      setGeneralError(error.message || 'L\'inscription a échoué');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (authMode === 'login') {
        await handleLogin();
      } else if (authMode === 'signup') {
        await handleSignup();
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    loading,
    authMode,
    passwordStrength,
    loginAttempts,
    resetSent,
    formErrors,
    generalError,
    
    // Setters
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setAuthMode,
    setPasswordStrength,
    
    // Actions
    handleSubmit,
    handlePasswordReset,
  };
};
