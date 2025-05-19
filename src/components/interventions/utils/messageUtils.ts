
export const getEmptyStateMessage = (currentView: string): string => {
  switch (currentView) {
    case 'scheduled':
      return 'Aucune intervention planifiée.';
    case 'in-progress':
      return 'Aucune intervention en cours.';
    case 'completed':
      return 'Aucune intervention terminée.';
    case 'field-tracking':
      return 'Aucune intervention terrain à suivre.';
    case 'requests':
      return 'Aucune demande d\'intervention.';
    case 'history':
      return 'Aucun historique d\'intervention.';
    case 'observations':
      return 'Aucune observation terrain trouvée.';
    default:
      return 'Aucune intervention trouvée correspondant à vos critères de recherche.';
  }
};
