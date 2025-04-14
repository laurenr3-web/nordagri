import { format, formatDistance, differenceInDays, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Format a date to a readable string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = new Date(date);
  return format(dateObj, 'dd MMMM yyyy', { locale: fr });
};

/**
 * Format a date to a short string
 */
export const formatShortDate = (date: Date | string): string => {
  const dateObj = new Date(date);
  return format(dateObj, 'dd/MM/yy', { locale: fr });
};

/**
 * Format a date with time
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = new Date(date);
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: fr });
};

/**
 * Format a relative date (e.g. "il y a 3 jours")
 */
export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = new Date(date);
  const days = differenceInDays(new Date(), dateObj);
  
  if (days === 0 && isSameDay(new Date(), dateObj)) {
    return "Aujourd'hui";
  } else if (days === 1) {
    return "Hier";
  } else if (days > 1 && days <= 7) {
    return formatDistance(dateObj, new Date(), { addSuffix: true, locale: fr });
  } else {
    return format(dateObj, 'dd MMMM yyyy', { locale: fr });
  }
};

/**
 * Format a duration in milliseconds to a readable string (HH:MM:SS)
 */
export const formatDuration = (durationMs: number): string => {
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
};

/**
 * Format a duration in hours (e.g. "2.5h")
 */
export const formatHours = (hours: number): string => {
  return hours.toFixed(1) + 'h';
};

/**
 * Format a duration in minutes to hours and minutes (e.g. "2h 30min")
 */
export const formatMinutesToHours = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  
  if (hours === 0) {
    return `${minutes} min`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}min`;
  }
};

/**
 * Convert a date to ISO string format
 */
export const toISOString = (date: Date | string): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toISOString();
};
