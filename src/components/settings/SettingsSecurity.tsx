
import React, { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Lock, ShieldAlert, Key } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/AuthProvider';

export function SettingsSecurity() {
  const { user } = useAuthContext();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast.error("Email utilisateur non disponible");
      return;
    }
    
    if (showResetForm) {
      // Valider le mot de passe
      if (password.length < 8) {
        toast.error('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }
      
      if (password !== confirmPassword) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
      }
      
      try {
        setLoading(true);
        
        const { error } = await supabase.auth.updateUser({
          password: password
        });
        
        if (error) throw error;
        
        toast.success('Mot de passe mis à jour avec succès');
        setShowResetForm(false);
        setPassword('');
        setConfirmPassword('');
      } catch (error: any) {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
        toast.error(error.message || 'Impossible de mettre à jour le mot de passe');
      } finally {
        setLoading(false);
      }
    } else {
      setShowResetForm(true);
    }
  };

  const handleSendPasswordResetLink = async () => {
    if (!user?.email) {
      toast.error("Email utilisateur non disponible");
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/settings?tab=security`,
      });
      
      if (error) throw error;
      
      toast.success('Lien de réinitialisation envoyé à votre adresse email');
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du lien de réinitialisation:', error);
      toast.error(error.message || 'Impossible d\'envoyer le lien de réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection
      title="Paramètres de sécurité"
      description="Gérez la sécurité de votre compte et les contrôles d'accès"
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-2 flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Gestion du mot de passe</CardTitle>
                <CardDescription>Mettez à jour votre mot de passe ou demandez une réinitialisation</CardDescription>
              </CardHeader>
              <CardContent>
                {showResetForm ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Nouveau mot de passe</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
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
                      {user?.email ? `Votre adresse email est ${user.email}` : 'Chargement de vos informations...'}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleSendPasswordResetLink}
                  disabled={loading || !user?.email}
                >
                  Envoyer un lien de réinitialisation
                </Button>
                <Button 
                  onClick={handlePasswordReset} 
                  disabled={loading || !user?.email || (showResetForm && (!password || !confirmPassword))}
                >
                  {showResetForm ? 'Mettre à jour le mot de passe' : 'Changer de mot de passe'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <Key className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-2 flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Authentification à deux facteurs</CardTitle>
                <CardDescription>Ajoutez une couche de sécurité supplémentaire à votre compte</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    L'authentification à deux facteurs sera disponible prochainement.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button disabled>Configurer l'A2F</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
