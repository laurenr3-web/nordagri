import type { Step } from 'react-joyride';

/**
 * Tour de bienvenue Nordagri — première connexion.
 * Steps Desktop & Mobile sont déclarés séparément (pas de slice).
 */

export const welcomeStepsDesktop: Step[] = [
  {
    target: 'body',
    placement: 'center',
    title: 'Bienvenue sur Nordagri 🌾',
    content:
      "Faisons un tour rapide pour vous montrer l'essentiel : navigation, équipements et profil. Vous pouvez quitter à tout moment.",
    skipBeacon: true,
  },
  {
    target: '[data-tour="sidebar-nav"]',
    placement: 'right',
    title: 'Navigation principale',
    content:
      'Toutes les sections de votre ERP agricole sont ici : tableau de bord, planning, équipements, maintenance, pièces et statistiques.',
    skipBeacon: true,
  },
  {
    target: '[data-tour="nav-equipment"]',
    placement: 'right',
    title: 'Vos équipements',
    content:
      'Suivez vos tracteurs, outils et machines : compteurs d’usage, photos, observations et historique de maintenance.',
    skipBeacon: true,
  },
  {
    target: '[data-tour="user-avatar"]',
    placement: 'bottom-end',
    title: 'Votre profil',
    content:
      'Accédez à votre profil et aux Réglages. Vous pourrez relancer ce tutoriel à tout moment depuis cette zone.',
    skipBeacon: true,
  },
];

export const welcomeStepsMobile: Step[] = [
  {
    target: 'body',
    placement: 'center',
    title: 'Bienvenue sur Nordagri 🌾',
    content:
      "Faisons un tour rapide. Vous pouvez quitter à tout moment et le relancer depuis les Réglages.",
    skipBeacon: true,
  },
  {
    target: '[data-tour="mobile-quick-bar"]',
    placement: 'top',
    title: 'Navigation rapide',
    content:
      'Vos sections principales sont accessibles ici. Le bouton « Plus » ouvre toutes les autres rubriques (équipements, maintenance, pièces…).',
    skipBeacon: true,
  },
  {
    target: '[data-tour="user-avatar"]',
    placement: 'bottom',
    title: 'Votre profil',
    content:
      'Accédez à votre profil et aux Réglages. Vous pourrez relancer ce tutoriel à tout moment.',
    skipBeacon: true,
  },
];