
/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  code: string;
  status: number;
  
  constructor(message: string, code: string = 'UNKNOWN_ERROR', status: number = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    
    // This is necessary for instanceof to work correctly
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Erreur spécifique aux problèmes de connexion à Supabase
 */
export class SupabaseConnectionError extends AppError {
  originalError?: Error;
  
  constructor(message: string, originalError?: Error) {
    super(message, 'SUPABASE_CONNECTION_ERROR', 503);
    this.name = 'SupabaseConnectionError';
    this.originalError = originalError;
    
    Object.setPrototypeOf(this, SupabaseConnectionError.prototype);
  }
}

/**
 * Erreur spécifique aux problèmes d'authentification Supabase
 */
export class SupabaseAuthError extends AppError {
  originalError?: Error;
  
  constructor(message: string, originalError?: Error) {
    super(message, 'SUPABASE_AUTH_ERROR', 401);
    this.name = 'SupabaseAuthError';
    this.originalError = originalError;
    
    Object.setPrototypeOf(this, SupabaseAuthError.prototype);
  }
}

/**
 * Erreur pour les problèmes temporaires qui peuvent être résolus par un réessai
 */
export class RetryableError extends AppError {
  retryAfter?: number;
  
  constructor(message: string, retryAfter?: number) {
    super(message, 'RETRYABLE_ERROR', 503);
    this.name = 'RetryableError';
    this.retryAfter = retryAfter;
    
    Object.setPrototypeOf(this, RetryableError.prototype);
  }
}

/**
 * Erreur pour les problèmes de validation de données
 */
export class ValidationError extends AppError {
  fieldErrors?: Record<string, string>;
  
  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
    
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error handler for async functions
 */
export function withErrorHandling<T>(
  fn: (...args: any[]) => Promise<T>,
  errorHandler?: (error: Error) => void
): (...args: any[]) => Promise<T> {
  return async (...args: any[]): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Error caught in withErrorHandling:', error);
      
      if (errorHandler) {
        errorHandler(error as Error);
      }
      
      throw error;
    }
  };
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Une erreur inattendue est survenue';
}

/**
 * Determine if an error should be reported to monitoring systems
 */
export function shouldReportError(error: unknown): boolean {
  if (error instanceof AppError) {
    // Don't report 4xx errors
    return error.status >= 500;
  }
  
  // Report all other errors
  return true;
}

/**
 * Récupère une erreur lisible par l'utilisateur à partir de l'erreur Supabase
 */
export function getSupabaseErrorMessage(error: any): string {
  if (!error) return 'Erreur inconnue';
  
  // Erreurs d'authentification
  if (error.code === 'auth/invalid-credential') {
    return 'Identifiants invalides. Vérifiez votre email et mot de passe.';
  }
  
  if (error.code === 'auth/user-not-found') {
    return 'Aucun utilisateur trouvé avec ces identifiants.';
  }
  
  if (error.code === 'auth/too-many-requests') {
    return 'Trop de tentatives. Veuillez réessayer plus tard.';
  }
  
  if (error.code === '401') {
    return 'Votre session a expiré. Veuillez vous reconnecter.';
  }
  
  // Erreurs de base de données
  if (error.code === '23505') {
    return 'Cette donnée existe déjà dans le système.';
  }
  
  if (error.code === '40001') {
    return 'Conflit lors de la modification des données. Veuillez réessayer.';
  }
  
  // Erreurs de réseau
  if (error.name === 'NetworkError' || error.name === 'TypeError' || error.code === 'ERR_NETWORK') {
    return 'Problème de connexion. Vérifiez votre connexion internet.';
  }
  
  // Erreur par défaut
  return error.message || 'Une erreur est survenue lors de la communication avec le serveur';
}
