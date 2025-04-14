
import { useState, useEffect } from 'react';

export const usePasswordStrength = (password: string) => {
  const [passwordStrength, setPasswordStrength] = useState(0);

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
  }, [password]);

  return {
    passwordStrength,
    setPasswordStrength
  };
};
