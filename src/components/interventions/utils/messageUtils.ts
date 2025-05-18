
/**
 * Returns appropriate empty state message based on current view
 */
export const getEmptyStateMessage = (view: string): string => {
  switch (view) {
    case 'scheduled':
      return "Aucune intervention planifiée.";
    case 'in-progress':
      return "Aucune intervention en cours.";
    case 'completed':
      return "Aucune intervention terminée.";
    case 'field-tracking':
      return "Aucun suivi terrain disponible.";
    case 'requests':
      return "Aucune demande d'intervention.";
    case 'observations':
      return "Aucune observation de terrain.";
    case 'history':
      return "Aucun historique d'intervention.";
    default:
      return "Aucune intervention disponible.";
  }
};
