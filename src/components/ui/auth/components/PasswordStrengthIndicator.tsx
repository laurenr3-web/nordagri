
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, CircleAlert } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  passwordStrength: number;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  passwordStrength
}) => {
  if (!password) return null;
  
  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between text-xs">
        <span>Password strength:</span>
        <span className={
          passwordStrength < 50 ? "text-destructive" : 
          passwordStrength < 75 ? "text-amber-500" : 
          "text-green-500"
        }>
          {passwordStrength < 50 ? "Weak" : 
           passwordStrength < 75 ? "Medium" : 
           "Strong"}
        </span>
      </div>
      <Progress value={passwordStrength} className={
        passwordStrength < 50 ? "text-destructive" : 
        passwordStrength < 75 ? "text-amber-500" : 
        "text-green-500"
      } />
      <ul className="text-xs space-y-1 mt-2">
        <li className="flex items-center gap-1">
          {password.length >= 8 ? 
            <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
            <CircleAlert className="h-3 w-3 text-muted-foreground" />}
          At least 8 characters
        </li>
        <li className="flex items-center gap-1">
          {/[A-Z]/.test(password) ? 
            <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
            <CircleAlert className="h-3 w-3 text-muted-foreground" />}
          Contains uppercase letter
        </li>
        <li className="flex items-center gap-1">
          {/[0-9]/.test(password) ? 
            <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
            <CircleAlert className="h-3 w-3 text-muted-foreground" />}
          Contains number
        </li>
        <li className="flex items-center gap-1">
          {/[^A-Za-z0-9]/.test(password) ? 
            <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
            <CircleAlert className="h-3 w-3 text-muted-foreground" />}
          Contains special character
        </li>
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator;
