/**
 * Centralisation des routes de l'application
 * Permet d'éviter les chaînes codées en dur et facilite la maintenance
 */

export const AppRoutes = {
  // Routes principales de l'application
  HOME: '/',
  DASHBOARD: '/dashboard',
  EQUIPMENT: '/equipment',
  EQUIPMENT_DETAIL: (id?: number | string) => id ? `/equipment/${id}` : '/equipment/:id',
  MAINTENANCE: '/maintenance',
  PARTS: '/parts',
  INTERVENTIONS: '/interventions',
  SETTINGS: '/settings',
  
  // Routes d'authentification
  AUTH: '/auth',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Routes spécifiques aux fonctionnalités
  QR_SCAN: '/scan/:id',
  QR_SCAN_WITH_ID: (id: string) => `/scan/${id}`,
  
  // Routes d'erreur
  NOT_FOUND: '*',
};

/**
 * Construire une URL de redirection avec paramètres de requête
 * @param path Chemin de base
 * @param params Paramètres à ajouter dans l'URL
 * @returns URL complète avec paramètres
 */
export function buildUrl(path: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) {
    return path;
  }
  
  const searchParams = new URLSearchParams();
  
  for (const [key, value] of Object.entries(params)) {
    searchParams.append(key, value);
  }
  
  return `${path}?${searchParams.toString()}`;
}

/**
 * Construire une URL de redirection "returnTo"
 * @param path Chemin vers lequel rediriger après authentification
 * @returns URL complète avec paramètre returnTo
 */
export function buildReturnToUrl(path: string): string {
  return buildUrl(AppRoutes.AUTH, { returnTo: encodeURIComponent(path) });
}

export default AppRoutes;
