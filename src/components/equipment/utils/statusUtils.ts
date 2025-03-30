
/**
 * Couleurs pour les différents statuts d'équipement
 */
export function getStatusColor(status: string | undefined): string {
  switch (status) {
    case 'operational':
      return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
    case 'maintenance':
      return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
    case 'repair':
      return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
    case 'inactive':
      return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    default:
      return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
  }
}

/**
 * Texte pour les différents statuts d'équipement
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

/**
 * Formate une date pour l'affichage
 */
export function formatDate(date: Date | string | undefined): string {
  if (!date) return 'Non spécifié';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
