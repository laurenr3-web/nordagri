import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-700 dark:text-blue-50';
    case 'in-progress':
      return 'bg-orange-50 text-orange-700 dark:bg-orange-700 dark:text-orange-50';
    case 'completed':
      return 'bg-green-50 text-green-700 dark:bg-green-700 dark:text-green-50';
    case 'canceled':
      return 'bg-red-50 text-red-700 dark:bg-red-700 dark:text-red-50';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100';
  }
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  // Convert to date object if it's a string
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  
  // Format the date in a user-friendly way
  return dateObject.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
