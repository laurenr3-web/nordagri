
import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from './PasswordInput';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface SignupFormProps {
  firstName: string;
  setFirstName: (firstName: string) => void;
  lastName: string;
  setLastName: (lastName: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  passwordStrength: number;
  setPasswordStrength: (strength: number) => void;
  loading: boolean;
  formErrors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
  };
}

const SignupForm: React.FC<SignupFormProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  passwordStrength,
  setPasswordStrength,
  loading,
  formErrors
}) => {
  // Password validation
  useEffect(() => {
    if (password) {
      let strength = 0;
      
      // Length check
      if (password.length >= 8) strength += 25;
      
      // Uppercase check
      if (/[A-Z]/.test(password)) strength += 25;
      
      // Number check
      if (/[0-9]/.test(password)) strength += 25;
      
      // Special character check
      if (/[^A-Za-z0-9]/.test(password)) strength += 25;
      
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password, setPasswordStrength]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input 
            id="firstName" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={loading}
            placeholder="Votre prénom"
            required
          />
          {formErrors.firstName && (
            <p className="text-sm text-destructive">{formErrors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input 
            id="lastName" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={loading}
            placeholder="Votre nom"
            required
          />
          {formErrors.lastName && (
            <p className="text-sm text-destructive">{formErrors.lastName}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input 
          id="signup-email" 
          type="email" 
          placeholder="Entrez votre email"
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
        <Label htmlFor="signup-password">Mot de passe</Label>
        <PasswordInput
          id="signup-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          placeholder="Créez un mot de passe sécurisé"
          required
        />
        {formErrors.password && (
          <p className="text-sm text-destructive">{formErrors.password}</p>
        )}
        
        <PasswordStrengthIndicator 
          password={password} 
          passwordStrength={passwordStrength} 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <PasswordInput 
          id="confirmPassword" 
          placeholder="Confirmez votre mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          required
        />
        {formErrors.confirmPassword && (
          <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
        )}
      </div>
    </div>
  );
};

export default SignupForm;
