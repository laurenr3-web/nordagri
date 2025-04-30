
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface LoginWarningProps {
  loginAttempts: number;
}

const LoginWarning: React.FC<LoginWarningProps> = ({ loginAttempts }) => {
  if (loginAttempts === 0) return null;

  let warningMessage = "";
  let warningLevel: 'low' | 'medium' | 'high' = 'low';

  if (loginAttempts === 1) {
    warningMessage = "Email ou mot de passe incorrect. Veuillez réessayer.";
    warningLevel = 'low';
  } else if (loginAttempts < 4) {
    warningMessage = `${loginAttempts} tentatives échouées. ${5 - loginAttempts} essais restants.`;
    warningLevel = 'medium';
  } else if (loginAttempts === 4) {
    warningMessage = "Attention: Dernier essai avant verrouillage temporaire.";
    warningLevel = 'high';
  } else {
    warningMessage = "Compte temporairement bloqué. Veuillez réessayer plus tard.";
    warningLevel = 'high';
  }

  const variants = {
    low: "bg-blue-50 text-blue-800 border-blue-200",
    medium: "bg-yellow-50 text-yellow-800 border-yellow-200",
    high: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <Alert className={`${variants[warningLevel]} border`}>
      <AlertTriangle className="h-4 w-4 mr-2" />
      <AlertDescription>{warningMessage}</AlertDescription>
    </Alert>
  );
};

export default LoginWarning;
