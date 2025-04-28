
/**
 * Utility functions for converting compatibility values
 * between number[] (used in the frontend) and string[] (used in the database)
 */

/**
 * Converts string[] to number[]
 */
export function compatibilityToNumbers(compatibility: string[] | number[] | undefined): number[] {
  if (!compatibility) return [];
  
  // If already number[], return as is
  if (Array.isArray(compatibility) && compatibility.length > 0 && typeof compatibility[0] === 'number') {
    return compatibility as number[];
  }
  
  // Convert string[] to number[]
  if (Array.isArray(compatibility)) {
    return (compatibility as string[])
      .map(id => typeof id === 'string' ? parseInt(id, 10) : id)
      .filter(id => !isNaN(Number(id))) as number[];
  }
  
  return [];
}

/**
 * Converts number[] to string[]
 */
export function compatibilityToStrings(compatibility: number[] | string[] | undefined): string[] {
  if (!compatibility) return [];
  
  // If already string[], return as is
  if (Array.isArray(compatibility) && compatibility.length > 0 && typeof compatibility[0] === 'string') {
    return compatibility as string[];
  }
  
  // Convert number[] to string[]
  if (Array.isArray(compatibility)) {
    return (compatibility as number[]).map(id => id.toString());
  }
  
  return [];
}

/**
 * Parses a comma-separated string into number[]
 */
export function parseCompatibilityString(compatibilityString: string | number[] | undefined): number[] {
  if (!compatibilityString) {
    return [];
  }
  
  // If already array, convert to numbers
  if (Array.isArray(compatibilityString)) {
    return compatibilityToNumbers(compatibilityString);
  }
  
  // Parse string to number[]
  return compatibilityString
    .split(',')
    .map(item => parseInt(item.trim(), 10))
    .filter(id => !isNaN(id));
}
