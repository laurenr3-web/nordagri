
/**
 * Converts a Date, string, or null/undefined to an ISO string format
 * @param date The date to convert
 * @returns ISO string representation or null if input is null/undefined
 */
export function toISOString(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  if (date instanceof Date) return date.toISOString();
  return date;
}

/**
 * Converts an ISO string to a Date object
 * @param isoString The ISO string to convert
 * @returns Date object or null if input is null/undefined
 */
export function fromISOString(isoString: string | null | undefined): Date | null {
  if (!isoString) return null;
  return new Date(isoString);
}
