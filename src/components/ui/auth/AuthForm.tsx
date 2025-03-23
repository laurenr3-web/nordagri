
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, CircleAlert, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [showPassword, setShowPassword] = useState(false);
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

  // Password validation
  useEffect(() => {
    if (password) {
      let strength = 0;
      
      // Length check
      if (password.length >= 8) strength += 25;
      
      // Uppercase check
      if (/[A-Z]/.test(password)) strength += 25;
      
      // Number check
      if (/[0-9]/.test(password)) strength += 25;
      
      // Special character check
      if (/[^A-Za-z0-9]/.test(password)) strength += 25;
      
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

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

  // Render password reset form
  if (authMode === 'reset') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl text-center">Reset Your Password</CardTitle>
          <CardDescription className="text-center">
            {!resetSent 
              ? 'Enter your email to receive password reset instructions' 
              : 'Check your email for the reset link'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordReset}>
          <CardContent className="space-y-4 pt-6">
            {!resetSent ? (
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input 
                  id="reset-email" 
                  type="email" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>
            ) : (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  We've sent you an email with instructions to reset your password.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            {!resetSent && (
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </Button>
            )}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => setAuthMode('login')}
            >
              Back to Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl text-center">Welcome to OptiTractor</CardTitle>
        <CardDescription className="text-center">
          {authMode === 'login' 
            ? 'Sign in to your account to continue' 
            : 'Create a new account to get started'}
        </CardDescription>
      </CardHeader>
      <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'login' | 'signup')}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
      </Tabs>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          {authMode === 'signup' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            {formErrors.email && (
              <p className="text-sm text-destructive">{formErrors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {formErrors.password && (
              <p className="text-sm text-destructive">{formErrors.password}</p>
            )}
            
            {authMode === 'signup' && password && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Password strength:</span>
                  <span className={
                    passwordStrength < 50 ? "text-destructive" : 
                    passwordStrength < 75 ? "text-amber-500" : 
                    "text-green-500"
                  }>
                    {passwordStrength < 50 ? "Weak" : 
                     passwordStrength < 75 ? "Medium" : 
                     "Strong"}
                  </span>
                </div>
                <Progress value={passwordStrength} className={
                  passwordStrength < 50 ? "text-destructive" : 
                  passwordStrength < 75 ? "text-amber-500" : 
                  "text-green-500"
                } />
                <ul className="text-xs space-y-1 mt-2">
                  <li className="flex items-center gap-1">
                    {password.length >= 8 ? 
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                      <CircleAlert className="h-3 w-3 text-muted-foreground" />}
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-1">
                    {/[A-Z]/.test(password) ? 
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                      <CircleAlert className="h-3 w-3 text-muted-foreground" />}
                    Contains uppercase letter
                  </li>
                  <li className="flex items-center gap-1">
                    {/[0-9]/.test(password) ? 
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                      <CircleAlert className="h-3 w-3 text-muted-foreground" />}
                    Contains number
                  </li>
                  <li className="flex items-center gap-1">
                    {/[^A-Za-z0-9]/.test(password) ? 
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                      <CircleAlert className="h-3 w-3 text-muted-foreground" />}
                    Contains special character
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          {authMode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
              {formErrors.confirmPassword && (
                <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
              )}
            </div>
          )}
          
          {authMode === 'login' && (
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="link" 
                className="p-0 h-auto text-sm"
                onClick={() => setAuthMode('reset')}
              >
                Forgot password?
              </Button>
            </div>
          )}
          
          {loginAttempts > 2 && authMode === 'login' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {loginAttempts >= 5 
                  ? "Too many failed attempts. Please try again later or reset your password." 
                  : `Warning: ${5 - loginAttempts} login attempts remaining.`}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || (authMode === 'login' && loginAttempts >= 5)}
          >
            {loading 
              ? 'Please wait...' 
              : authMode === 'login' 
                ? 'Sign In' 
                : 'Create Account'}
          </Button>
          
          {authMode === 'signup' && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};
