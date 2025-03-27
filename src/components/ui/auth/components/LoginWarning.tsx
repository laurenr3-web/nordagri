
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface LoginWarningProps {
  loginAttempts: number;
}

const LoginWarning: React.FC<LoginWarningProps> = ({ loginAttempts }) => {
  if (loginAttempts <= 2) return null;
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {loginAttempts >= 5 
          ? "Too many failed attempts. Please try again later or reset your password." 
          : `Warning: ${5 - loginAttempts} login attempts remaining.`}
      </AlertDescription>
    </Alert>
  );
};

export default LoginWarning;
