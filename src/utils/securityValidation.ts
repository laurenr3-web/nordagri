
/**
 * Security validation utilities
 */

/**
 * Validate email format securely
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  issues: string[];
} => {
  const issues: string[] = [];
  let score = 0;

  if (password.length < 8) {
    issues.push('Au moins 8 caractères requis');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    issues.push('Au moins une lettre minuscule requise');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    issues.push('Au moins une lettre majuscule requise');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    issues.push('Au moins un chiffre requis');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    issues.push('Au moins un caractère spécial requis');
  } else {
    score += 1;
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return {
    isValid: issues.length === 0,
    strength,
    issues
  };
};

/**
 * Sanitize user input for database storage
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

/**
 * Validate farm member role
 */
export const validateRole = (role: string): boolean => {
  const validRoles = ['owner', 'admin', 'member', 'viewer'];
  return validRoles.includes(role);
};

/**
 * Rate limiting helper for login attempts
 */
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return {
    checkLimit: (identifier: string): boolean => {
      const now = Date.now();
      const record = attempts.get(identifier);

      if (!record || now > record.resetTime) {
        attempts.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
      }

      if (record.count >= maxAttempts) {
        return false;
      }

      record.count++;
      return true;
    },
    
    reset: (identifier: string): void => {
      attempts.delete(identifier);
    }
  };
};
