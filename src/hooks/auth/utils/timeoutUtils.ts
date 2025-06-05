
/**
 * Utility functions for creating timeout promises
 */
export const createTimeoutPromise = (message: string, timeoutMs: number = 3000) => {
  return new Promise((_, reject) => 
    setTimeout(() => reject(new Error(message)), timeoutMs)
  );
};

export const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
  const timeoutPromise = createTimeoutPromise(timeoutMessage, timeoutMs);
  return Promise.race([promise, timeoutPromise]) as Promise<T>;
};
