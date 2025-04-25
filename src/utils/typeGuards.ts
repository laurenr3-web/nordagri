
/**
 * Fonction pour garantir qu'un ID est de type numérique
 * 
 * @param id L'ID qui peut être une chaîne ou un nombre
 * @returns L'ID converti en nombre si nécessaire
 */
export function ensureNumberId(id: string | number): number {
  if (typeof id === 'string') {
    return parseInt(id, 10);
  }
  return id;
}

/**
 * Vérifie si une valeur est un tableau
 * 
 * @param value La valeur à vérifier
 * @returns true si la valeur est un tableau, false sinon
 */
export function isArray<T>(value: any): value is Array<T> {
  return Array.isArray(value);
}

/**
 * Vérifie si une valeur est définie (non undefined ni null)
 * 
 * @param value La valeur à vérifier
 * @returns true si la valeur est définie, false sinon
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
