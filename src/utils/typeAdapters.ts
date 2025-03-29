
/**
 * Adaptateurs de types pour la conversion entre différents formats
 * Utile pour les transformations d'ID et autre normalisations de données
 */

/**
 * Convertit n'importe quel ID (string ou number) en number
 * Utile pour les appels d'API qui nécessitent des ID numériques
 */
export function ensureNumericId(id: string | number): number {
  if (id === null || id === undefined) {
    console.error("ID invalide fourni à ensureNumericId:", id);
    return 0;
  }
  return typeof id === 'string' ? parseInt(id, 10) : id;
}

/**
 * Convertit n'importe quel ID (string ou number) en string
 * Utile pour l'affichage ou les clés React
 */
export function ensureStringId(id: string | number): string {
  if (id === null || id === undefined) {
    console.error("ID invalide fourni à ensureStringId:", id);
    return '';
  }
  return typeof id === 'number' ? id.toString() : id;
}

/**
 * Assurez-vous qu'une valeur est un nombre
 * Renvoie 0 si la conversion échoue
 */
export function ensureNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? defaultValue : num;
}

/**
 * Assurez-vous qu'une valeur est une chaîne
 */
export function ensureString(value: any, defaultValue: string = ''): string {
  if (value === null || value === undefined) return defaultValue;
  return value.toString();
}
