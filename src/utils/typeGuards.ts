
/**
 * Utility functions for type checking and conversion
 */

/**
 * Checks if a value is numeric
 */
export function isNumeric(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Ensures an ID is a number
 */
export function ensureNumberId(id: string | number): number {
  if (typeof id === 'string') {
    const num = parseInt(id, 10);
    if (isNaN(num)) {
      throw new TypeError(`Invalid ID format: ${id}. Expected a numeric string.`);
    }
    return num;
  }
  return id;
}

/**
 * Ensures an ID is a string
 */
export function ensureStringId(id: string | number): string {
  if (typeof id === 'number') {
    return id.toString();
  }
  return id;
}

/**
 * Validates that a status string is one of the allowed equipment statuses
 */
export function validateEquipmentStatus(status?: string): 'operational' | 'maintenance' | 'repair' | 'inactive' {
  const validStatuses = ['operational', 'maintenance', 'repair', 'inactive'] as const;
  type ValidStatus = typeof validStatuses[number];
  
  if (status && validStatuses.includes(status as ValidStatus)) {
    return status as ValidStatus;
  }
  
  return 'operational';
}
