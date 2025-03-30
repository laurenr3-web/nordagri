
/**
 * Convertit une date en chaîne ISO pour Supabase
 */
export function dateToIsoString(date: Date | string | undefined): string | null {
  if (!date) return null;
  
  if (typeof date === 'string') {
    // Vérifier si la chaîne est déjà au format ISO
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(date)) {
      return date;
    }
    
    // Tenter de convertir la chaîne en date
    try {
      const parsedDate = new Date(date);
      return parsedDate.toISOString();
    } catch {
      return null;
    }
  }
  
  if (date instanceof Date) {
    return date.toISOString();
  }
  
  return null;
}

/**
 * Formate une date pour l'affichage
 */
export function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Génère des couleurs pour les différents statuts d'équipement
 */
export function getStatusColor(status: string | undefined): string {
  switch (status) {
    case 'operational':
      return 'bg-green-500';
    case 'maintenance':
      return 'bg-yellow-500';
    case 'repair':
      return 'bg-red-500';
    case 'inactive':
      return 'bg-gray-500';
    default:
      return 'bg-blue-500';
  }
}

/**
 * Traduit les statuts en français
 */
export function getStatusText(status: string | undefined): string {
  switch (status) {
    case 'operational':
      return 'Opérationnel';
    case 'maintenance':
      return 'En maintenance';
    case 'repair':
      return 'En réparation';
    case 'inactive':
      return 'Inactif';
    default:
      return 'Inconnu';
  }
}
