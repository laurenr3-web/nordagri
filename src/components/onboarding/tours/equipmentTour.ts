import type { Step } from 'react-joyride';

/**
 * Tour contextuel sur la page de détail d'un équipement.
 * Steps Desktop & Mobile déclarés séparément (pas de slice).
 */

export const equipmentStepsDesktop: Step[] = [
  {
    target: 'body',
    placement: 'center',
    title: 'Votre équipement en détail',
    content:
      'Voici la fiche complète de votre équipement. Voyons les actions clés que vous pouvez effectuer ici.',
    skipBeacon: true,
  },
  {
    target: '[data-tour="equipment-quick-actions"]',
    placement: 'bottom',
    title: 'Actions rapides',
    content:
      'Mettez à jour le compteur (heures ou km), planifiez une maintenance ou consignez une observation en un clic.',
    skipBeacon: true,
  },
  {
    target: '[data-tour="equipment-counters"]',
    placement: 'top',
    title: 'Compteur d’usure',
    content:
      "Maintenez le compteur à jour : c'est lui qui déclenche les maintenances basées sur l'usage (heures ou km).",
    skipBeacon: true,
  },
  {
    target: '[data-tour="equipment-tabs"]',
    placement: 'top',
    title: 'Historique et infos',
    content:
      'Photos, maintenances, observations, interventions et QR code : tout est centralisé dans ces onglets.',
    skipBeacon: true,
  },
];

export const equipmentStepsMobile: Step[] = [
  {
    target: 'body',
    placement: 'center',
    title: 'Votre équipement',
    content:
      'Voici la fiche détaillée. Découvrons les actions principales.',
    skipBeacon: true,
  },
  {
    target: '[data-tour="equipment-quick-actions"]',
    placement: 'bottom',
    title: 'Actions rapides',
    content:
      'Compteur, maintenance, observation : tout est accessible ici.',
    skipBeacon: true,
  },
  {
    target: '[data-tour="equipment-tabs"]',
    placement: 'top',
    title: 'Onglets',
    content:
      'Photos, historique de maintenance et QR code se trouvent dans ces onglets.',
    skipBeacon: true,
  },
];