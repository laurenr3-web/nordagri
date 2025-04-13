/**
 * Utility functions to convert between different case styles and data formats
 */

/**
 * Convert a camelCase string to snake_case
 * @param str The string to convert
 */
export function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert a snake_case string to camelCase
 * @param str The string to convert
 */
export function snakeToCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert an object with camelCase keys to one with snake_case keys
 * @param obj The object to convert
 */
export function convertToSnakeCase<T = Record<string, unknown>>(obj: Record<string, any>): T {
  if (!obj || typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return obj as unknown as T;
  }
  
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = camelToSnakeCase(key);
      const value = obj[key];
      
      // Handle nested objects and arrays with objects
      if (value !== null && typeof value === 'object') {
        if (Array.isArray(value)) {
          result[snakeKey] = value.map(item => 
            typeof item === 'object' && item !== null 
              ? convertToSnakeCase(item) 
              : item
          );
        } else if (value instanceof Date) {
          result[snakeKey] = value.toISOString();
        } else {
          result[snakeKey] = convertToSnakeCase(value);
        }
      } else {
        result[snakeKey] = value;
      }
    }
  }
  
  return result as T;
}

/**
 * Convert an object with snake_case keys to one with camelCase keys
 * @param obj The object to convert
 */
export function convertToCamelCase<T = Record<string, unknown>>(obj: Record<string, any>): T {
  if (!obj || typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return obj as unknown as T;
  }
  
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = snakeToCamelCase(key);
      const value = obj[key];
      
      // Handle nested objects and arrays with objects
      if (value !== null && typeof value === 'object') {
        if (Array.isArray(value)) {
          result[camelKey] = value.map(item => 
            typeof item === 'object' && item !== null 
              ? convertToCamelCase(item) 
              : item
          );
        } else {
          result[camelKey] = convertToCamelCase(value);
        }
      } else {
        result[camelKey] = value;
      }
    }
  }
  
  return result as T;
}

/**
 * Parse JSON fields that are stored as strings
 * @param obj The object with potential string JSON fields
 * @param jsonFields Array of field names that should be parsed as JSON
 */
export function parseJsonFields<T = Record<string, unknown>>(
  obj: Record<string, any>, 
  jsonFields: string[]
): T {
  if (!obj || typeof obj !== 'object' || obj === null) {
    return obj as unknown as T;
  }
  
  const result = { ...obj };
  
  for (const field of jsonFields) {
    if (
      Object.prototype.hasOwnProperty.call(result, field) && 
      typeof result[field] === 'string'
    ) {
      try {
        result[field] = JSON.parse(result[field]);
      } catch (error) {
        // Keep as string if parsing fails
        console.warn(`Failed to parse JSON field ${field}:`, error);
      }
    }
  }
  
  return result as T;
}

/**
 * Convert a database object to an application model object
 * @param dbObject The database object with snake_case properties
 * @param jsonFields Optional array of field names that should be parsed as JSON
 */
export function convertFromApi<T = Record<string, unknown>>(
  dbObject: Record<string, any>,
  jsonFields: string[] = []
): T {
  // First convert case style
  const camelCaseObject = convertToCamelCase(dbObject);
  
  // Then parse any JSON fields
  return parseJsonFields(camelCaseObject, jsonFields) as T;
}

/**
 * Convert an application model object to a database object
 * @param modelObject The model object with camelCase properties
 */
export function convertToApi<T = Record<string, unknown>>(modelObject: Record<string, any>): T {
  return convertToSnakeCase(modelObject) as T;
}

/**
 * Safely convert a string status to a typed status enum value
 * @param status The status string from database
 * @param validValues Array of valid status values
 * @param defaultValue Default status to use if input is invalid
 */
export function safeEnumValue<T extends string>(
  status: string | undefined, 
  validValues: readonly T[],
  defaultValue: T
): T {
  if (!status || !validValues.includes(status as T)) {
    return defaultValue;
  }
  return status as T;
}

/**
 * Convert a string date to a Date object, with validation
 */
export function safeDate(dateStr: string | null | undefined): Date | undefined {
  if (!dateStr) return undefined;
  
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? undefined : date;
}
