export type HelpCategory =
  | 'equipment'
  | 'maintenance'
  | 'parts'
  | 'surveillance'
  | 'planning'
  | 'time'
  | 'team';

export interface HelpArticle {
  id: string;
  title: string;
  category: HelpCategory;
  readTime: number;
  keywords: string[];
  content: string;
}

export interface HelpCategoryMeta {
  id: HelpCategory;
  label: string;
  order: number;
}

export const HELP_CATEGORIES: HelpCategoryMeta[] = [
  { id: 'equipment', label: 'Équipements', order: 1 },
  { id: 'maintenance', label: 'Maintenance', order: 2 },
  { id: 'parts', label: 'Pièces détachées', order: 3 },
  { id: 'surveillance', label: 'Points à surveiller', order: 4 },
  { id: 'planning', label: 'Planning', order: 5 },
  { id: 'time', label: 'Temps de travail', order: 6 },
  { id: 'team', label: 'Équipe', order: 7 },
];