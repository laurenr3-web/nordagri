/**
 * Converts a compatibility string to an array of numbers
 * @param compatibilityString String in the format "1, 2, 3" or similar
 * @returns Array of numeric IDs
 */
export function parseCompatibilityString(compatibilityString: string | undefined | null): number[] {
  if (!compatibilityString) return [];
  
  return compatibilityString
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0)
    .map(id => parseInt(id, 10))
    .filter(id => !isNaN(id));
}

/**
 * Ensures that compatibility is in the form of an array of numbers
 * @param compatibility Compatibility in any form
 * @returns Normalized array of numbers
 */
export function compatibilityToNumbers(compatibility: any): number[] {
  // If undefined or null
  if (!compatibility) return [];
  
  // If already an array
  if (Array.isArray(compatibility)) {
    return compatibility
      .map(id => {
        // If the element is a string, try to convert to number
        if (typeof id === 'string') {
          const num = Number(id);
          return isNaN(num) ? null : num;
        }
        // If already a number, keep it
        else if (typeof id === 'number') {
          return id;
        }
        // Otherwise, ignore this element
        return null;
      })
      .filter((id): id is number => id !== null);
  }
  
  // If it's a string, treat as comma-separated list
  if (typeof compatibility === 'string') {
    return parseCompatibilityString(compatibility);
  }
  
  // Default return empty array
  return [];
}

/**
 * Converts an array of numbers to a formatted string
 * @param compatibilityArray Array of numbers
 * @returns Formatted string "1, 2, 3"
 */
export function numberArrayToString(compatibilityArray: number[]): string {
  if (!Array.isArray(compatibilityArray)) return '';
  return compatibilityArray.join(', ');
}

/**
 * Converts an array of numbers to an array of strings (for database)
 * @param compatibilityArray Array of numbers or undefined/null
 * @returns Array of strings for database
 */
export function compatibilityToStrings(compatibilityArray: number[] | undefined | null): string[] {
  if (!compatibilityArray || !Array.isArray(compatibilityArray)) return [];
  
  // Convert each number to string, ignoring non-numeric values
  return compatibilityArray
    .filter(id => typeof id === 'number' && !isNaN(id))
    .map(id => id.toString());
}
