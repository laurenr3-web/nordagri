
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
