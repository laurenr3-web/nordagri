import type { PlanningCategory } from './planningService';

/**
 * Mapping strict catégorie Planning → valeur DB de `task_types.name`.
 * Toutes les valeurs cibles existent dans la table `task_types`.
 */
export const PLANNING_CATEGORY_TO_TASK_TYPE = {
  animaux: 'other',
  champs: 'fieldwork',
  alimentation: 'other',
  equipement: 'maintenance',
  batiment: 'maintenance',
  administration: 'other',
  autre: 'other',
} as const satisfies Record<PlanningCategory, string>;

export const PLANNING_CATEGORY_LABELS: Record<PlanningCategory, string> = {
  animaux: 'Animaux',
  champs: 'Champs',
  alimentation: 'Alimentation',
  equipement: 'Équipement',
  batiment: 'Bâtiment',
  administration: 'Administration',
  autre: 'Autre',
};

export function mapCategoryToTaskType(c: PlanningCategory): string {
  return PLANNING_CATEGORY_TO_TASK_TYPE[c] ?? 'other';
}