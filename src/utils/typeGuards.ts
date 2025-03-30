
/**
 * Garantit qu'un ID est converti en nombre si c'est une chaîne de caractères
 * @param id Un ID qui peut être un nombre ou une chaîne
 * @returns L'ID converti en nombre
 */
export function ensureNumberId(id: number | string): number {
  if (typeof id === 'string') {
    // Tenter de convertir en nombre
    const numericId = Number(id);
    
    // Vérifier si la conversion est valide (pas NaN)
    if (isNaN(numericId)) {
      throw new Error(`ID invalide: "${id}" ne peut pas être converti en nombre`);
    }
    
    return numericId;
  }
  
  // Déjà un nombre
  return id;
}

/**
 * Vérifie si une valeur est définie et non nulle
 * @param value La valeur à vérifier
 * @returns true si la valeur est définie et non nulle
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Vérifie si une valeur est une chaîne de caractères non vide
 * @param value La valeur à vérifier
 * @returns true si la valeur est une chaîne de caractères non vide
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Vérifie si une valeur est un nombre ou une chaîne numérique
 * @param value La valeur à vérifier
 * @returns true si la valeur est numérique
 */
export function isNumeric(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  
  if (typeof value === 'number') {
    return !isNaN(value);
  }
  
  if (typeof value === 'string') {
    // Vérifier si la chaîne peut être convertie en nombre
    const num = Number(value);
    return !isNaN(num);
  }
  
  return false;
}

/**
 * Valide et retourne un statut d'équipement
 * Retourne 'operational' par défaut si le statut est invalide
 * @param status Le statut à valider
 * @returns Un statut d'équipement valide
 */
export function validateEquipmentStatus(status?: string): 'operational' | 'maintenance' | 'repair' | 'inactive' {
  const validStatuses = ['operational', 'maintenance', 'repair', 'inactive'] as const;
  
  if (!status || !validStatuses.includes(status as any)) {
    return 'operational'; // Valeur par défaut
  }
  
  return status as 'operational' | 'maintenance' | 'repair' | 'inactive';
}
