
/**
 * Utilitaires pour obtenir les variantes des badges en fonction du statut et de la priorité
 */

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'info';
    case 'in-progress':
      return 'warning';
    case 'completed':
      return 'success';
    case 'canceled':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const getPriorityBadgeVariant = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'warning';
    case 'low':
      return 'secondary';
    default:
      return 'outline';
  }
};
