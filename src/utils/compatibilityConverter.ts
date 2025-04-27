
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
  if (compatibility.length > 0 && typeof compatibility[0] === 'number') {
    return compatibility as number[];
  }
  
  // Convert string[] to number[]
  return (compatibility as string[])
    .map(id => parseInt(id, 10))
    .filter(id => !isNaN(id));
}

/**
 * Converts number[] to string[]
 */
export function compatibilityToStrings(compatibility: number[] | string[] | undefined): string[] {
  if (!compatibility) return [];
  
  // If already string[], return as is
  if (compatibility.length > 0 && typeof compatibility[0] === 'string') {
    return compatibility as string[];
  }
  
  // Convert number[] to string[]
  return (compatibility as number[]).map(id => id.toString());
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
    .map(item => parseInt(item.trim()))
    .filter(id => !isNaN(id));
}
