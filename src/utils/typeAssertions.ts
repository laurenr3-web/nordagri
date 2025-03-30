
/**
 * Utilitaires d'assertion de type pour renforcer la sécurité du typage
 * Ces fonctions permettent de valider les types au runtime et de générer des erreurs explicites
 */

/**
 * Assertion générique qui vérifie une valeur avec un validateur personnalisé
 * @param value Valeur à vérifier
 * @param validator Fonction qui valide la valeur
 * @param errorMessage Message d'erreur en cas d'échec
 * @returns La valeur typée si valide
 */
export function assertType<T>(value: unknown, validator: (value: unknown) => boolean, errorMessage: string): T {
  if (!validator(value)) {
    throw new TypeError(errorMessage);
  }
  return value as T;
}

/**
 * Vérifie qu'une valeur est un nombre valide
 * @param value Valeur à vérifier
 * @returns Le nombre validé
 */
export function assertIsNumber(value: unknown): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new TypeError(`Expected a number but got: ${value}`);
  }
  return value;
}

/**
 * Vérifie qu'une valeur est une chaîne de caractères
 * @param value Valeur à vérifier
 * @returns La chaîne validée
 */
export function assertIsString(value: unknown): string {
  if (typeof value !== 'string') {
    throw new TypeError(`Expected a string but got: ${typeof value}`);
  }
  return value;
}

/**
 * Vérifie qu'une valeur est un objet (et pas null)
 * @param value Valeur à vérifier
 * @returns L'objet validé
 */
export function assertIsObject(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new TypeError(`Expected an object but got: ${typeof value}`);
  }
  return value as Record<string, unknown>;
}

/**
 * Vérifie qu'une valeur existe (n'est pas null ou undefined)
 * @param value Valeur à vérifier
 * @param name Nom de la valeur pour le message d'erreur
 * @returns La valeur non-null validée
 */
export function assertIsDefined<T>(value: T | null | undefined, name = 'Value'): T {
  if (value === null || value === undefined) {
    throw new TypeError(`${name} is required but got: ${value}`);
  }
  return value;
}

/**
 * Vérifie qu'une valeur est un tableau
 * @param value Valeur à vérifier
 * @returns Le tableau validé
 */
export function assertIsArray<T>(value: unknown): T[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`Expected an array but got: ${typeof value}`);
  }
  return value as T[];
}

/**
 * Vérifie qu'une valeur est un ID valide (nombre ou chaîne non vide)
 * @param value Valeur à vérifier
 * @returns L'ID validé (sous sa forme originale)
 */
export function assertIsValidId(value: unknown): string | number {
  if (
    (typeof value !== 'number' && typeof value !== 'string') || 
    (typeof value === 'string' && value.trim() === '') ||
    (typeof value === 'number' && isNaN(value))
  ) {
    throw new TypeError(`Expected a valid ID (number or non-empty string) but got: ${value}`);
  }
  return value;
}
