import type { ComponentType } from 'react';
import { Target, ListPlus, LayoutDashboard, Settings } from 'lucide-react';

export type OnboardingStepId =
  | 'add-point'
  | 'create-task'
  | 'dashboard'
  | 'settings-replay';

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  description: string;
  /** Path to navigate to before showing this step. */
  route: string;
  /** data-onboarding attribute value of the highlighted element. */
  target: string;
  /** Short label used in the checklist. */
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'add-point',
    label: 'Ajouter un point',
    title: 'Ajoute un point à surveiller',
    description:
      "Un point te permet de noter ce que tu veux suivre dans le temps (ex : un problème sur un animal ou un équipement).",
    route: '/points',
    target: 'add-point',
    icon: Target,
  },
  {
    id: 'create-task',
    label: 'Créer une tâche',
    title: 'Crée une tâche',
    description:
      "Crée une tâche pour régler ce point. Tu pourras la planifier et l'assigner à quelqu'un.",
    route: '/planning',
    target: 'create-task',
    icon: ListPlus,
  },
  {
    id: 'dashboard',
    label: 'Voir le tableau de bord',
    title: 'Ton tableau de bord',
    description:
      "Ici tu vois ce qui demande ton attention aujourd'hui : points à surveiller, tâches du jour et alertes.",
    route: '/dashboard',
    target: 'dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'settings-replay',
    label: 'Revoir le tutoriel',
    title: 'Retrouve ce tutoriel quand tu veux',
    description:
      "Ouvre Paramètres → Profil. Tu y trouveras le bouton « Revoir » pour relancer ce tour à tout moment.",
    route: '/settings',
    target: 'replay-tutorial',
    icon: Settings,
  },
];