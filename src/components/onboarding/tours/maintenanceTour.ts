import type { Step } from 'react-joyride';

/**
 * Tour contextuel sur la page Maintenance (3 étapes, mêmes steps mobile/desktop).
 */

export const maintenanceStepsDesktop: Step[] = [
  {
    target: 'body',
    placement: 'center',
    title: 'Module Maintenance',
    content:
      'Planifiez et suivez l’entretien de votre flotte : tâches préventives, calendrier, alertes.',
    skipBeacon: true,
  },
  {
    target: '[data-tour="maintenance-new-task"]',
    placement: 'bottom-end',
    title: 'Créer une tâche',
    content:
      'Créez une nouvelle tâche d’entretien : périodicité par date ou par compteur (heures / km).',
    skipBeacon: true,
  },
  {
    target: '[data-tour="maintenance-tabs"]',
    placement: 'bottom',
    title: 'Tâches & tableau de bord',
    content:
      'Basculez entre la liste des tâches et le tableau de bord pour une vue d’ensemble de votre maintenance.',
    skipBeacon: true,
  },
];

export const maintenanceStepsMobile: Step[] = maintenanceStepsDesktop;