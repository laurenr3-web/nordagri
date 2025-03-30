
import { useState, useEffect } from 'react';
import { useFormValidation } from './useFormValidation';
import { usePasswordStrength } from './usePasswordStrength';
import { useAuthHandlers } from './useAuthHandlers';

export const useAuthForm = (onSuccess?: () => void) => {
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');

  // Compose hooks
  const { formErrors, setFormErrors, validateForm, emailRegex } = useFormValidation();
  const { passwordStrength, setPasswordStrength } = usePasswordStrength(password);
  const { 
    loading, 
    setLoading, 
    loginAttempts, 
    resetSent, 
    handlePasswordReset: handleReset, 
    handleLogin: login, 
    handleSignup: signup 
  } = useAuthHandlers(onSuccess);

  // Check for password reset or verification params in URL
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('reset') === 'true') {
      toast.info('Please check your email to reset your password');
    }
    if (url.searchParams.get('verification') === 'true') {
      toast.info('Please check your email to verify your account');
    }
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    await handleReset(e, email, emailRegex, setFormErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(email, password, confirmPassword, authMode)) return;
    
    setLoading(true);
    
    try {
      if (authMode === 'login') {
        await login(email, password);
      } else if (authMode === 'signup') {
        await signup(email, password, firstName, lastName);
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

// Import toast at the top
import { toast } from 'sonner';
