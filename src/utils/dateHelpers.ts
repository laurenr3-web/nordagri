
/**
 * Format a duration in milliseconds into a string with hours, minutes, and seconds
 */
export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const pad = (num: number): string => num.toString().padStart(2, '0');
  
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format a date into a readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Format a time into a readable string
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format a date and time into a readable string
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(d)} ${formatTime(d)}`;
}

/**
 * Calculate the duration between two dates in hours
 * @param startTime The start date/time
 * @param endTime The end date/time (defaults to now if not provided)
 * @returns Duration in hours, capped at 24 hours
 */
export function calculateDuration(startTime: string | Date, endTime?: string | Date | null): number {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  
  // Validation
  if (isNaN(start.getTime()) || (endTime && isNaN(end.getTime()))) {
    logger.error('Invalid date provided');
    return 0;
  }
  
  const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  
  // Limit to 24h max and don't accept negative values
  return Math.max(0, Math.min(duration, 24));
}
