
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

interface ResetPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  resetSent: boolean;
  loading: boolean;
  formErrors: { email?: string };
  handlePasswordReset: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  email,
  setEmail,
  resetSent,
  loading,
  formErrors,
  handlePasswordReset,
  onBackToLogin
}) => {
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
            onClick={onBackToLogin}
          >
            Back to Login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ResetPasswordForm;
