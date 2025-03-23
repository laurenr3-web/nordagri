
import React, { useState, useEffect } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Lock, ShieldAlert, User } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export const SecuritySection = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [showResetForm, setShowResetForm] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setEmail(session.user.email);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    getUser();
  }, []);

  const handlePasswordReset = async () => {
    if (!email) return;
    
    if (showResetForm) {
      // Validate password
      if (password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
      
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      try {
        setLoading(true);
        
        const { error } = await supabase.auth.updateUser({
          password: password
        });
        
        if (error) throw error;
        
        toast.success('Password updated successfully');
        setShowResetForm(false);
        setPassword('');
        setConfirmPassword('');
      } catch (error: any) {
        console.error('Error updating password:', error);
        toast.error(error.message || 'Failed to update password');
      } finally {
        setLoading(false);
      }
    } else {
      setShowResetForm(true);
    }
  };

  const handleSendPasswordResetLink = async () => {
    if (!email) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/settings?tab=security`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      console.error('Error sending reset link:', error);
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection
      title="Security Settings"
      description="Manage your account security and access controls"
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-2 flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Password Management</CardTitle>
                <CardDescription>Update your password or request a password reset</CardDescription>
              </CardHeader>
              <CardContent>
                {showResetForm ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        disabled={loading}
                      />
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {email ? `Your account email is ${email}` : 'Loading your account information...'}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleSendPasswordResetLink}
                  disabled={loading || !email}
                >
                  Send Reset Link
                </Button>
                <Button 
                  onClick={handlePasswordReset} 
                  disabled={loading || !email || (showResetForm && (!password || !confirmPassword))}
                >
                  {showResetForm ? 'Update Password' : 'Change Password'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-2 flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Multi-factor authentication is coming soon.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button disabled>Set Up MFA</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
};
