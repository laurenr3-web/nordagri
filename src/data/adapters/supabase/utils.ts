
import { toISOString } from '@/utils/dateHelpers';

/**
 * Fonction utilitaire pour convertir les dates en strings ISO
 */
export function convertDatesToISOStrings(obj: Record<string, any>): Record<string, any> {
  const result = { ...obj };
  
  for (const key in result) {
    if (result[key] instanceof Date) {
      result[key] = toISOString(result[key]);
    }
  }
  
  return result;
}
