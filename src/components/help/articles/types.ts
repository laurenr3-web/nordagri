export type HelpCategory =
  | 'getting-started'
  | 'dashboard'
  | 'equipment'
  | 'maintenance'
  | 'parts'
  | 'surveillance'
  | 'planning'
  | 'time'
  | 'team'
  | 'statistics'
  | 'scan'
  | 'notifications'
  | 'settings'
  | 'troubleshooting';

export interface HelpArticle {
  id: string;
  title: string;
  category: HelpCategory;
  readTime: number;
  keywords: string[];
  /**
   * Tags affichés à l'utilisateur, cliquables comme filtres dans
   * le centre d'aide. Distincts de `keywords` (purement matching texte).
   */
  tags: string[];
  content: string;
}

export interface HelpCategoryMeta {
  id: HelpCategory;
  label: string;
  order: number;
}

export const HELP_CATEGORIES: HelpCategoryMeta[] = [
  { id: 'getting-started', label: 'Bien démarrer', order: 1 },
  { id: 'dashboard', label: 'Tableau de bord', order: 2 },
  { id: 'planning', label: 'Planning', order: 3 },
  { id: 'surveillance', label: 'Points à surveiller', order: 4 },
  { id: 'equipment', label: 'Équipements', order: 5 },
  { id: 'maintenance', label: 'Maintenance', order: 6 },
  { id: 'parts', label: 'Pièces détachées', order: 7 },
  { id: 'time', label: 'Temps de travail', order: 8 },
  { id: 'team', label: 'Équipe', order: 9 },
  { id: 'statistics', label: 'Statistiques', order: 10 },
  { id: 'scan', label: 'Scanner QR', order: 11 },
  { id: 'notifications', label: 'Notifications', order: 12 },
  { id: 'settings', label: 'Paramètres', order: 13 },
  { id: 'troubleshooting', label: 'Dépannage', order: 14 },
];
