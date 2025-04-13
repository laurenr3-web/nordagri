
/**
 * Utility functions to convert between different data formats in the application
 */

/**
 * Convert snake_case database field names to camelCase for frontend use
 */
export function dbToCamelCase<T>(dbObject: Record<string, any>): T {
  const result: Record<string, any> = {};
  
  for (const key in dbObject) {
    if (Object.prototype.hasOwnProperty.call(dbObject, key)) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      result[camelKey] = dbObject[key];
    }
  }
  
  return result as T;
}

/**
 * Convert camelCase frontend field names to snake_case for database use
 */
export function camelCaseToDb<T>(jsObject: Record<string, any>): T {
  const result: Record<string, any> = {};
  
  for (const key in jsObject) {
    if (Object.prototype.hasOwnProperty.call(jsObject, key)) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeKey] = jsObject[key];
    }
  }
  
  return result as T;
}

/**
 * Safely convert a string status to an enum compatible status
 * @param status The status string from database
 * @param validStatuses Array of valid status values
 * @param defaultStatus Default status to use if input is invalid
 * @returns A valid status string
 */
export function safeStatus<T extends string>(
  status: string | undefined, 
  validStatuses: T[],
  defaultStatus: T
): T {
  if (!status || !validStatuses.includes(status as T)) {
    return defaultStatus;
  }
  return status as T;
}
