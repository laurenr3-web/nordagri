export interface TooltipContent {
  title: string;
  body: string;
  articleId?: string;
}

export const tooltips = {
  // Équipements
  'equipment.status': {
    title: "Statut de l'équipement",
    body: "Operational : en service. Maintenance : en cours d'entretien. Repair : en réparation. Inactive : hors service.",
    articleId: 'equipment-organize',
  },
  'equipment.counters': {
    title: "Compteurs d'usure",
    body: "Heures pour les moteurs (tracteurs, moissonneuses), kilomètres pour les véhicules routiers. Mettez à jour régulièrement pour déclencher la maintenance préventive.",
  },
  'equipment.qr': {
    title: 'Code QR',
    body: "Imprimez et collez sur l'équipement. Scannez avec votre téléphone pour accéder rapidement à la fiche, l'historique et planifier une intervention.",
  },

  // Maintenance
  'maintenance.preventive': {
    title: 'Maintenance préventive',
    body: "Planifiée à intervalles réguliers (heures moteur, dates fixes) pour éviter les pannes. Idéale pour les vidanges, filtres, graissages.",
    articleId: 'maintenance-seasons',
  },
  'maintenance.corrective': {
    title: 'Maintenance corrective',
    body: "Intervention suite à une panne ou un dysfonctionnement constaté. À documenter pour suivre la fiabilité de votre flotte.",
  },
  'maintenance.priority': {
    title: 'Priorité',
    body: "Critique : à faire immédiatement (équipement bloqué). Important : sous 7 jours. À faire : sans urgence.",
  },
  'maintenance.type': {
    title: 'Type de tâche',
    body: "Choisissez Préventive pour planifier à l'avance, ou Corrective pour documenter une panne.",
  },

  // Pièces
  'parts.lowStock': {
    title: 'Seuil de stock bas',
    body: "Vous serez alerté quand le stock passe sous ce seuil. Définissez un niveau qui vous laisse le temps de commander.",
    articleId: 'parts-stock',
  },
  'parts.stock': {
    title: 'Stock disponible',
    body: "Quantité actuellement en stock. Mise à jour automatique lors des retraits liés à une intervention.",
  },

  // Points à surveiller
  'surveillance.status': {
    title: 'Statut',
    body: "En cours : action active. À surveiller : observation passive. Réglé : terminé, conservé pour l'historique.",
    articleId: 'surveillance-vs-intervention',
  },
  'surveillance.nextCheck': {
    title: 'Prochaine vérification',
    body: "Planifiez quand revérifier ce point (1, 3, 7, 14 jours ou date personnalisée). Vous serez alerté à la date prévue.",
  },

  // Dashboard
  'dashboard.widget.toCheck': {
    title: "À vérifier aujourd'hui",
    body: "Regroupe tous les points à surveiller dont la prochaine vérification est due aujourd'hui ou en retard.",
  },

  // Préparés pour Messages suivants
  'planning.recurring': {
    title: 'Tâche récurrente',
    body: "Se reproduit automatiquement (quotidienne, hebdomadaire, mensuelle). Idéale pour les routines (traite, alimentation).",
    articleId: 'daily-planning',
  },
  'planning.swipe': {
    title: 'Glisser pour terminer',
    body: "Sur mobile : glissez vers la droite pour terminer une tâche, vers la gauche pour la reporter au lendemain.",
  },
  'time.session': {
    title: 'Session de travail',
    body: "Démarrez un compteur lié à un équipement et une intervention. Utile pour la facturation client (ETA) et l'analyse des coûts.",
    articleId: 'time-tracking',
  },
  'roles.hierarchy': {
    title: 'Hiérarchie des rôles',
    body: "Owner : tous droits + facturation. Admin : gère équipe et paramètres. Member : utilise au quotidien. Viewer : consultation uniquement.",
    articleId: 'invite-members',
  },
} as const satisfies Record<string, TooltipContent>;

export type TooltipKey = keyof typeof tooltips;