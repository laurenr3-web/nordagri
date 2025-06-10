
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import PasswordInput from './PasswordInput';
import LoginWarning from './LoginWarning';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Form validation
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const errors: {
      email?: string;
      password?: string;
    } = {};
    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = "L'email est requis";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      errors.email = "Veuillez entrer une adresse email valide";
      isValid = false;
    }

    // Password validation
    if (!password) {
      errors.password = "Le mot de passe est requis";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous error
    setErrorMessage(null);
    
    // Validate form
    if (!validateForm()) return;
    
    // Check login attempts
    if (loginAttempts >= 5) {
      setErrorMessage('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Tenter de se connecter
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // Incrémenter le compteur de tentatives
        setLoginAttempts(prev => prev + 1);
        
        // Analyser le message d'erreur pour afficher un message plus précis
        if (error.message.includes('Email not confirmed')) {
          setErrorMessage('Veuillez confirmer votre adresse email avant de vous connecter. Vérifiez votre boîte mail pour le lien de confirmation.');
        } else if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Identifiants incorrects. Veuillez vérifier votre email et mot de passe. Si vous venez de créer votre compte, assurez-vous d\'avoir confirmé votre email.');
        } else {
          // Message d'erreur générique
          setErrorMessage(error.message || 'Une erreur est survenue lors de la connexion.');
        }
        return;
      }
      
      if (!data.session) {
        throw new Error('Session non créée');
      }
      
      // Connexion réussie
      console.log('Connexion réussie:', new Date().toISOString());
      
      // Réinitialiser le compteur de tentatives
      setLoginAttempts(0);
      
      // Afficher un message de succès
      toast.success('Connexion réussie');
      
      // Rediriger ou appeler le callback de succès
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error('Erreur d\'authentification:', error);
      setErrorMessage('Une erreur inattendue est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/auth?mode=reset');
  };

  // Fonction pour envoyer à nouveau l'email de confirmation
  const handleResendConfirmation = async () => {
    if (!email) {
      setFormErrors({ email: "Veuillez entrer votre adresse email" });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      
      toast.success('Email de confirmation envoyé avec succès. Veuillez vérifier votre boîte mail.');
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      toast.error(error.message || "Impossible d'envoyer l'email de confirmation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <Alert variant="destructive" className="animate-in fade-in-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage}
            {errorMessage.includes('confirmer votre adresse email') && (
              <Button 
                type="button" 
                variant="link" 
                className="p-0 h-auto text-sm ml-2"
                onClick={handleResendConfirmation}
                disabled={loading}
              >
                Renvoyer l'email de confirmation
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="Entrez votre email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            // Clear error when typing
            if (formErrors.email) {
              setFormErrors(prev => ({ ...prev, email: undefined }));
            }
            if (errorMessage) {
              setErrorMessage(null);
            }
          }}
          disabled={loading}
          className={formErrors.email ? "border-destructive" : ""}
          required
        />
        {formErrors.email && (
          <p className="text-sm text-destructive">{formErrors.email}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            // Clear error when typing
            if (formErrors.password) {
              setFormErrors(prev => ({ ...prev, password: undefined }));
            }
            if (errorMessage) {
              setErrorMessage(null);
            }
          }}
          disabled={loading}
          className={formErrors.password ? "border-destructive" : ""}
          required
          placeholder="Entrez votre mot de passe"
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
          onClick={handleForgotPassword}
          disabled={loading}
        >
          Mot de passe oublié ?
        </Button>
      </div>
      
      <LoginWarning loginAttempts={loginAttempts} />
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || loginAttempts >= 5}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connexion en cours...
          </>
        ) : (
          'Se connecter'
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
