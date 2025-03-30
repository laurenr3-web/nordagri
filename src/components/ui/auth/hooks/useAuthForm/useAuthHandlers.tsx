
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

  const handleLogin = async (email: string, password: string) => {
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
