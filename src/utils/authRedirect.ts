const STORAGE_KEY = 'auth_redirect_target';

/**
 * Store a post-auth redirect target (e.g. /accept-invitation?id=xxx)
 */
export const setAuthRedirectTarget = (path: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, path);
  } catch {
    // localStorage might be unavailable
  }
};

/**
 * Read and clear the stored redirect target
 */
export const consumeAuthRedirectTarget = (): string | null => {
  try {
    const target = localStorage.getItem(STORAGE_KEY);
    if (target) {
      localStorage.removeItem(STORAGE_KEY);
      // Also clean up legacy key
      localStorage.removeItem('pendingInvitation');
    }
    return target;
  } catch {
    return null;
  }
};

/**
 * Peek at the stored redirect target without clearing it
 */
export const peekAuthRedirectTarget = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};
