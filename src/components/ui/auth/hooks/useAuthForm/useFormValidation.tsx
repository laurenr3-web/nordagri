
import { useState } from 'react';
import { toast } from 'sonner';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const useFormValidation = () => {
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // Email validation regex - plus stricte
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validatePassword = (password: string): boolean => {
    // Vérification des exigences de mot de passe
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    // Au moins 3 critères doivent être satisfaits
    const criteria = [minLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecial];
    const satisfiedCriteria = criteria.filter(c => c).length;
    
    return satisfiedCriteria >= 3;
  };

  const validateForm = (
    email: string, 
    password: string, 
    confirmPassword: string, 
    authMode: 'login' | 'signup' | 'reset'
  ) => {
    const errors: FormErrors = {};
    let isValid = true;

    // Email validation
    if (!email) {
      errors.email = "L'adresse email est requise";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      errors.email = "Veuillez entrer une adresse email valide";
      isValid = false;
    }

    // Password validation for signup and login
    if (authMode !== 'reset') {
      if (!password) {
        errors.password = "Le mot de passe est requis";
        isValid = false;
      } else if (authMode === 'signup') {
        if (password.length < 8) {
          errors.password = "Le mot de passe doit contenir au moins 8 caractères";
          isValid = false;
        } else if (!validatePassword(password)) {
          errors.password = "Le mot de passe doit satisfaire au moins 3 des critères suivants: 8+ caractères, majuscules, minuscules, chiffres, caractères spéciaux";
          isValid = false;
        }
      }
    }

    // Confirm password validation for signup
    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        errors.confirmPassword = "Les mots de passe ne correspondent pas";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  return {
    formErrors,
    setFormErrors,
    validateForm,
    validatePassword,
    emailRegex
  };
};
