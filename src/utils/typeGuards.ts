
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
    return parseInt(id, 10);
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
  const validStatuses = ['operational', 'maintenance', 'repair', 'inactive'];
  return (status && validStatuses.includes(status)) 
    ? (status as 'operational' | 'maintenance' | 'repair' | 'inactive') 
    : 'operational';
}
