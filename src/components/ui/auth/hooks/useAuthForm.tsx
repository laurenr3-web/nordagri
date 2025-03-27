
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
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  // Form validation
  const validateForm = () => {
    const errors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    // Email validation
    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation for signup and login
    if (authMode !== 'reset') {
      if (!password) {
        errors.password = "Password is required";
        isValid = false;
      } else if (authMode === 'signup' && password.length < 8) {
        errors.password = "Password must be at least 8 characters";
        isValid = false;
      }
    }

    // Confirm password validation for signup
    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !emailRegex.test(email)) {
      setFormErrors({ email: "Please enter a valid email address" });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) throw error;
      
      setResetSent(true);
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (loginAttempts >= 5) {
      toast.error('Too many login attempts. Please try again later.');
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
      const userIp = "client-side"; // In a real app, you'd get this from your server
      console.log(`Login success: ${timestamp}, IP: ${userIp}`);
      
      toast.success('Signed in successfully');
      setLoginAttempts(0);
      onSuccess?.();
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
    }
  };

  const handleSignup = async () => {
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
          emailRedirectTo: `${window.location.origin}/auth?verification=true`,
        }
      });
      
      if (signUpError) throw signUpError;
      
      toast.success('Account created! Please check your email to verify your account.');
      onSuccess?.();
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Registration failed');
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
