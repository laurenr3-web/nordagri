
/**
 * Traduit le statut en français
 */
export function translateStatus(status: string): string {
  switch (status) {
    case 'scheduled': return 'Planifiée';
    case 'in-progress': return 'En cours';
    case 'completed': return 'Terminée';
    case 'canceled': return 'Annulée';
    default: return status;
  }
}

/**
 * Traduit la priorité en français
 */
export function translatePriority(priority: string): string {
  switch (priority) {
    case 'low': return 'Basse';
    case 'medium': return 'Moyenne';
    case 'high': return 'Haute';
    default: return priority;
  }
}
