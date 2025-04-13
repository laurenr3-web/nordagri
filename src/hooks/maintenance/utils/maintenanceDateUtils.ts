
import { addDays, addWeeks, addMonths, format, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MaintenanceFrequency, MaintenanceUnit } from '../types/maintenancePlanTypes';

/**
 * Calculate the next due date based on frequency, interval and unit
 */
export const calculateNextDueDate = (
  frequency: MaintenanceFrequency,
  interval: number,
  unit: MaintenanceUnit,
  startDate: Date
): Date => {
  let nextDueDate: Date;

  switch (frequency) {
    case 'daily':
      nextDueDate = addDays(startDate, interval);
      break;
    case 'weekly':
      nextDueDate = addWeeks(startDate, interval);
      break;
    case 'monthly':
      nextDueDate = addMonths(startDate, interval);
      break;
    case 'quarterly':
      nextDueDate = addMonths(startDate, interval * 3);
      break;
    case 'biannual':
    case 'semi-annual':
      nextDueDate = addMonths(startDate, interval * 6);
      break;
    case 'yearly':
    case 'annual':
      nextDueDate = addMonths(startDate, interval * 12);
      break;
    default:
      nextDueDate = startDate;
  }

  return nextDueDate;
};

/**
 * Format a date for display
 */
export const getFormattedNextDueDate = (date: Date): string => {
  try {
    return format(date, 'PPP', { locale: fr });
  } catch (error) {
    console.error("Erreur lors du formatage de la date :", error);
    return 'Date inconnue';
  }
};
