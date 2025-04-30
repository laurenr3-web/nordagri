
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

interface ResetPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  resetSent: boolean;
  loading: boolean;
  formErrors: {
    email?: string;
  };
  handlePasswordReset: (e: React.FormEvent) => Promise<void>;
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
        <CardTitle className="text-xl text-center">
          {resetSent ? "Email envoyé" : "Réinitialisation du mot de passe"}
        </CardTitle>
        <CardDescription className="text-center">
          {resetSent
            ? "Consultez votre boîte de réception pour les instructions"
            : "Entrez votre email pour recevoir un lien de réinitialisation"}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handlePasswordReset}>
        <CardContent>
          {resetSent ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-center text-muted-foreground">
                Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
                Veuillez suivre les instructions pour créer un nouveau mot de passe.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Entrez votre adresse email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {resetSent ? (
            <Button 
              type="button"
              className="w-full"
              onClick={onBackToLogin}
              variant="default"
            >
              Retour à la connexion
            </Button>
          ) : (
            <>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !email}
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                className="w-full flex items-center justify-center mt-2"
                onClick={onBackToLogin}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la connexion
              </Button>
            </>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};

export default ResetPasswordForm;
