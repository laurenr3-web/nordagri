
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface LoginWarningProps {
  loginAttempts: number;
}

const LoginWarning: React.FC<LoginWarningProps> = ({ loginAttempts }) => {
  if (loginAttempts === 0) return null;
  
  if (loginAttempts >= 5) {
    return (
      <Alert variant="destructive" className="animate-in fade-in-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Trop de tentatives de connexion. Veuillez réessayer plus tard ou utiliser la fonction 
          "Mot de passe oublié" pour réinitialiser votre mot de passe.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (loginAttempts >= 3) {
    return (
      <Alert variant="warning" className="animate-in fade-in-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Plusieurs tentatives de connexion échouées. Vérifiez vos identifiants ou utilisez la fonction 
          "Mot de passe oublié" si nécessaire.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default LoginWarning;
