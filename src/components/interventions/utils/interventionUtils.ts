
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

// Add the missing getPriorityBadgeClass function
export function getPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case 'high':
      return 'bg-red-50 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-50';
    case 'medium':
      return 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-50';
    case 'low':
      return 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-50';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-100';
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

// Add the missing color functions needed by InterventionCard
export function getStatusColor(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'in-progress':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'canceled':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'medium':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}
