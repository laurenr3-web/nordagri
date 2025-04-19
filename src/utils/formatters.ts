
/**
 * Format date strings for display
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Format currency values for display
 */
export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null) return '-';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

/**
 * Format numbers with specified decimal places
 */
export function formatNumber(value?: number | null, decimalPlaces: number = 2): string {
  if (value === undefined || value === null) return '-';
  
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  }).format(value);
}
