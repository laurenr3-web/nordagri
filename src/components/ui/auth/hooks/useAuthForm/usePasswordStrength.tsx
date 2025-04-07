
import { useState, useEffect } from 'react';

export const usePasswordStrength = (password: string) => {
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength(0);
      return;
    }

    // Évaluer la force du mot de passe
    let strength = 0;
    
    // Longueur minimale (8 caractères)
    if (password.length >= 8) strength += 1;
    
    // Longueur forte (12+ caractères)
    if (password.length >= 12) strength += 1;
    
    // Lettres majuscules
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Lettres minuscules
    if (/[a-z]/.test(password)) strength += 1;
    
    // Chiffres
    if (/[0-9]/.test(password)) strength += 1;
    
    // Caractères spéciaux
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Normaliser sur une échelle de 0 à 4
    setPasswordStrength(Math.min(4, Math.floor(strength / 1.5)));
  }, [password]);

  return { passwordStrength, setPasswordStrength };
};
