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
 * Validate equipment status and return a proper EquipmentStatus type
 */
export function validateEquipmentStatus(status?: string | null): 'operational' | 'maintenance' | 'repair' | 'inactive' {
  const validStatuses = ['operational', 'maintenance', 'repair', 'inactive'];
  
  if (!status || !validStatuses.includes(status)) {
    return 'operational';
  }
  
  return status as 'operational' | 'maintenance' | 'repair' | 'inactive';
}

/**
 * Type guard for Equipment interface
 */
export function isEquipment(value: unknown): value is Equipment {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'type' in value &&
    'status' in value &&
    typeof (value as any).name === 'string' &&
    typeof (value as any).type === 'string'
  );
}
