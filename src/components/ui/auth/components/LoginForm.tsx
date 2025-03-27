
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from './PasswordInput';
import LoginWarning from './LoginWarning';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  loginAttempts: number;
  formErrors: {
    email?: string;
    password?: string;
  };
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  loginAttempts,
  formErrors,
  onForgotPassword
}) => {
  return (
    <div className="space-y-4">
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
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        {formErrors.password && (
          <p className="text-sm text-destructive">{formErrors.password}</p>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="button" 
          variant="link" 
          className="p-0 h-auto text-sm"
          onClick={onForgotPassword}
        >
          Forgot password?
        </Button>
      </div>
      
      <LoginWarning loginAttempts={loginAttempts} />
    </div>
  );
};

export default LoginForm;
