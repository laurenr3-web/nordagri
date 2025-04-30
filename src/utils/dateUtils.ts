
import { formatDistance, isToday, isYesterday, format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formats a date for display in the UI
 */
export function formatNotificationDate(dateString: string): string {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return formatDistance(date, new Date(), { addSuffix: true, locale: fr });
  } else if (isYesterday(date)) {
    return 'Hier';
  } else {
    return format(date, 'dd/MM/yyyy', { locale: fr });
  }
}

/**
 * Formats a time for display in the UI
 */
export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'HH:mm', { locale: fr });
}
