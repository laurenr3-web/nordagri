
import { useState } from 'react';

/**
 * Interface des erreurs de formulaire d'authentification
 */
interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * Hook pour la validation des formulaires d'authentification
 * 
 * Gère la validation des champs email, mot de passe et confirmation
 * de mot de passe pour les différents modes d'authentification.
 * 
 * @returns {Object} Erreurs et fonctions de validation
 */
export const useFormValidation = () => {
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Valide le formulaire d'authentification selon le mode
   * 
   * @param {string} email - Adresse email
   * @param {string} password - Mot de passe
   * @param {string} confirmPassword - Confirmation du mot de passe
   * @param {'login' | 'signup' | 'reset'} authMode - Mode d'authentification
   * @returns {boolean} Validité du formulaire
   */
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
      errors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation for signup and login
    if (authMode !== 'reset') {
      if (!password) {
        errors.password = "Password is required";
        isValid = false;
      } else if (authMode === 'signup' && password.length < 8) {
        errors.password = "Password must be at least 8 characters";
        isValid = false;
      }
    }

    // Confirm password validation for signup
    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
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
    emailRegex
  };
};
