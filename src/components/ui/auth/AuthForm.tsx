
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthForm } from './hooks/useAuthForm';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ResetPasswordForm from './components/ResetPasswordForm';

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const {
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
    
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setAuthMode,
    setPasswordStrength,
    
    handleSubmit,
    handlePasswordReset,
  } = useAuthForm(onSuccess);

  // Render password reset form
  if (authMode === 'reset') {
    return (
      <ResetPasswordForm
        email={email}
        setEmail={setEmail}
        resetSent={resetSent}
        loading={loading}
        formErrors={formErrors}
        handlePasswordReset={handlePasswordReset}
        onBackToLogin={() => setAuthMode('login')}
      />
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
          {authMode === 'login' ? (
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              loading={loading}
              loginAttempts={loginAttempts}
              formErrors={formErrors}
              onForgotPassword={() => setAuthMode('reset')}
            />
          ) : (
            <SignupForm
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              passwordStrength={passwordStrength}
              setPasswordStrength={setPasswordStrength}
              loading={loading}
              formErrors={formErrors}
            />
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
