import {
  Tractor,
  Wrench,
  Package,
  Eye,
  Calendar,
  Clock,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';

export interface EmptyStateContent {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  secondaryActionLabel?: string;
  articleId?: string;
}

export const emptyStates = {
  dashboardOnboarding: {
    icon: LayoutDashboard,
    title: 'Bienvenue sur Nordagri !',
    description:
      "Commencez par ajouter votre premier équipement. En 30 secondes, vous pourrez planifier sa maintenance et suivre son usure.",
    actionLabel: 'Ajouter un équipement',
    secondaryActionLabel: 'En savoir plus',
    articleId: 'equipment-organize',
  },
  equipmentList: {
    icon: Tractor,
    title: "Aucun équipement pour l'instant",
    description:
      "Ajoutez vos tracteurs, moissonneuses, remorques et autres machines. Chaque équipement aura sa fiche, son historique et son code QR.",
    actionLabel: 'Ajouter un équipement',
    secondaryActionLabel: 'Bien organiser sa flotte',
    articleId: 'equipment-organize',
  },
  maintenanceList: {
    icon: Wrench,
    title: 'Aucune intervention planifiée',
    description:
      "Profitez-en pour planifier votre maintenance préventive. Mieux vaut prévoir une vidange que tomber en panne en pleine récolte.",
    actionLabel: 'Planifier une maintenance',
    secondaryActionLabel: 'Maintenance saison par saison',
    articleId: 'maintenance-seasons',
  },
  partsList: {
    icon: Package,
    title: 'Démarrez votre inventaire',
    description:
      "Suivez vos pièces détachées (filtres, courroies, fluides) et recevez une alerte avant la rupture de stock.",
    actionLabel: 'Ajouter une pièce',
    secondaryActionLabel: 'Réduire ses ruptures de stock',
    articleId: 'parts-stock',
  },
  surveillanceList: {
    icon: Eye,
    title: 'Suivez ce qui demande votre attention',
    description:
      "Une vache qui boite, une parcelle qui souffre, une fuite à surveiller... Notez-le ici avec une photo et planifiez quand revérifier.",
    actionLabel: 'Créer un point à surveiller',
    secondaryActionLabel: 'Quand utiliser un point à surveiller ?',
    articleId: 'surveillance-vs-intervention',
  },
  planningEmpty: {
    icon: Calendar,
    title: 'Votre journée est libre 🌞',
    description:
      "Ajoutez une tâche du jour ou consultez les suggestions issues de votre maintenance préventive en attente.",
    actionLabel: 'Ajouter une tâche',
    secondaryActionLabel: 'Maîtriser son planning quotidien',
    articleId: 'daily-planning',
  },
  timeTrackingEmpty: {
    icon: Clock,
    title: 'Aucun temps enregistré',
    description:
      "Démarrez un compteur lié à un équipement et une intervention. Idéal pour facturer vos prestations ou suivre vos coûts.",
    actionLabel: 'Démarrer un compteur',
    secondaryActionLabel: 'Suivre le temps pour facturer',
    articleId: 'time-tracking',
  },
} as const satisfies Record<string, EmptyStateContent>;

export type EmptyStateKey = keyof typeof emptyStates;