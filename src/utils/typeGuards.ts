
/**
 * Assure qu'un ID est converti en nombre
 * 
 * @param id L'ID qui peut être une chaîne ou un nombre
 * @returns L'ID converti en nombre
 */
export function ensureNumberId(id: number | string): number {
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    if (isNaN(parsed)) {
      throw new Error(`Invalid ID format: ${id}`);
    }
    return parsed;
  }
  return id;
}

/**
 * Vérifie si une valeur est numérique
 * 
 * @param value La valeur à vérifier
 * @returns true si la valeur est numérique, false sinon
 */
export function isNumeric(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'number') {
    return !isNaN(value);
  }
  if (typeof value === 'string') {
    return !isNaN(Number(value)) && value.trim() !== '';
  }
  return false;
}

/**
 * Valide le statut d'un équipement et retourne une valeur par défaut si invalide
 * 
 * @param status Le statut à valider
 * @returns Le statut validé ou 'operational' par défaut
 */
export function validateEquipmentStatus(status?: string): 'operational' | 'maintenance' | 'repair' | 'inactive' {
  if (!status) {
    return 'operational';
  }
  
  const validStatuses = ['operational', 'maintenance', 'repair', 'inactive'];
  
  return validStatuses.includes(status) 
    ? status as 'operational' | 'maintenance' | 'repair' | 'inactive' 
    : 'operational';
}
