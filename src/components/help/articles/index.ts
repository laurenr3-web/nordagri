import type { HelpArticle } from './types';

import equipmentOrganize from './equipment-organize.md?raw';
import maintenanceSeasons from './maintenance-seasons.md?raw';
import partsStock from './parts-stock.md?raw';
import surveillanceVsIntervention from './surveillance-vs-intervention.md?raw';
import dailyPlanning from './daily-planning.md?raw';
import timeTracking from './time-tracking.md?raw';
import inviteMembers from './invite-members.md?raw';
import howToCreateEquipment from './how-to-create-equipment.md?raw';
import howToCreateMaintenance from './how-to-create-maintenance.md?raw';
import howToCreatePoint from './how-to-create-point.md?raw';
import howToCreatePart from './how-to-create-part.md?raw';
import howToCreatePlanningTask from './how-to-create-planning-task.md?raw';
import howToTrackTime from './how-to-track-time.md?raw';
import planningTaskTime from './planning-task-time.md?raw';
import quickStart from './quick-start.md?raw';
import dashboardOverview from './dashboard-overview.md?raw';
import howToScanQr from './how-to-scan-qr.md?raw';
import notificationsOverview from './notifications-overview.md?raw';
import statisticsOverview from './statistics-overview.md?raw';
import settingsOverview from './settings-overview.md?raw';
import troubleshootingCommon from './troubleshooting-common.md?raw';

export const helpArticles: Record<string, HelpArticle> = {
  'quick-start': {
    id: 'quick-start',
    title: 'Démarrage rapide en 5 minutes',
    category: 'getting-started',
    readTime: 5,
    keywords: ['démarrage', 'commencer', 'débuter', 'tour', 'guide', 'nouveau', 'ferme', 'premier'],
    tags: ['Démarrage', 'Guide', 'Nouveau'],
    content: quickStart,
  },
  'dashboard-overview': {
    id: 'dashboard-overview',
    title: 'Comprendre le tableau de bord',
    category: 'dashboard',
    readTime: 3,
    keywords: ['dashboard', 'tableau', 'bord', 'accueil', 'travail', 'jour', 'semaine', 'statistiques'],
    tags: ['Dashboard', 'Quotidien', 'Vue ensemble'],
    content: dashboardOverview,
  },
  'how-to-scan-qr': {
    id: 'how-to-scan-qr',
    title: 'Utiliser le scanner QR',
    category: 'scan',
    readTime: 3,
    keywords: ['QR', 'code', 'scan', 'scanner', 'caméra', 'équipement', 'fiche'],
    tags: ['Scan', 'QR', 'Équipement'],
    content: howToScanQr,
  },
  'notifications-overview': {
    id: 'notifications-overview',
    title: 'Comprendre et gérer les notifications',
    category: 'notifications',
    readTime: 3,
    keywords: ['notification', 'alerte', 'cloche', 'mail', 'courriel', 'maintenance', 'tâche'],
    tags: ['Notifications', 'Alertes'],
    content: notificationsOverview,
  },
  'statistics-overview': {
    id: 'statistics-overview',
    title: 'Lire les statistiques',
    category: 'statistics',
    readTime: 4,
    keywords: ['statistique', 'rapport', 'temps', 'membre', 'performance', 'kpi', 'période'],
    tags: ['Statistiques', 'Temps', 'Rapport'],
    content: statisticsOverview,
  },
  'settings-overview': {
    id: 'settings-overview',
    title: 'Naviguer dans les paramètres',
    category: 'settings',
    readTime: 3,
    keywords: ['paramètre', 'setting', 'profil', 'ferme', 'sécurité', 'mot de passe', 'abonnement', 'déconnexion'],
    tags: ['Paramètres', 'Compte'],
    content: settingsOverview,
  },
  'troubleshooting-common': {
    id: 'troubleshooting-common',
    title: 'Problèmes fréquents et solutions',
    category: 'troubleshooting',
    readTime: 5,
    keywords: ['problème', 'bug', 'erreur', '404', 'sync', 'hors ligne', 'données', 'manquant', 'PWA', 'dépannage'],
    tags: ['Dépannage', 'Erreurs', 'Aide'],
    content: troubleshootingCommon,
  },
  'equipment-organize': {
    id: 'equipment-organize',
    title: 'Bien organiser sa flotte',
    category: 'equipment',
    readTime: 4,
    keywords: ['flotte', 'tracteur', 'équipement', 'organiser', 'inventaire'],
    tags: ['Démarrage', 'Équipement', 'Bonnes pratiques'],
    content: equipmentOrganize,
  },
  'maintenance-seasons': {
    id: 'maintenance-seasons',
    title: 'Maintenance saison par saison',
    category: 'maintenance',
    readTime: 5,
    keywords: ['maintenance', 'préventive', 'saison', 'printemps', 'récolte', 'hiver'],
    tags: ['Maintenance', 'Préventif', 'Saison'],
    content: maintenanceSeasons,
  },
  'parts-stock': {
    id: 'parts-stock',
    title: 'Réduire ses ruptures de pièces',
    category: 'parts',
    readTime: 4,
    keywords: ['pièces', 'stock', 'rupture', 'commande', 'inventaire'],
    tags: ['Stock', 'Pièces', 'Bonnes pratiques'],
    content: partsStock,
  },
  'surveillance-vs-intervention': {
    id: 'surveillance-vs-intervention',
    title: 'Quand utiliser un point à surveiller vs une intervention',
    category: 'surveillance',
    readTime: 3,
    keywords: ['point', 'surveiller', 'intervention', 'observation'],
    tags: ['Surveillance', 'Intervention', 'Concept'],
    content: surveillanceVsIntervention,
  },
  'daily-planning': {
    id: 'daily-planning',
    title: 'Maîtriser son planning quotidien',
    category: 'planning',
    readTime: 4,
    keywords: ['planning', 'tâche', 'récurrente', 'quotidien'],
    tags: ['Planning', 'Quotidien', 'Productivité'],
    content: dailyPlanning,
  },
  'time-tracking': {
    id: 'time-tracking',
    title: 'Suivre le temps pour facturer ses prestations',
    category: 'time',
    readTime: 4,
    keywords: ['temps', 'session', 'facturation', 'ETA', 'coût'],
    tags: ['Temps', 'Facturation', 'Suivi'],
    content: timeTracking,
  },
  'invite-members': {
    id: 'invite-members',
    title: 'Inviter et gérer son équipe',
    category: 'team',
    readTime: 3,
    keywords: ['équipe', 'inviter', 'rôle', 'admin', 'membre'],
    tags: ['Équipe', 'Démarrage', 'Rôles'],
    content: inviteMembers,
  },
  'how-to-create-equipment': {
    id: 'how-to-create-equipment',
    title: 'Comment créer un équipement',
    category: 'equipment',
    readTime: 5,
    keywords: ['formulaire', 'équipement', 'créer', 'ajouter', 'tracteur', 'unité', 'usure', 'compteur'],
    tags: ['Équipement', 'Formulaire', 'Démarrage'],
    content: howToCreateEquipment,
  },
  'how-to-create-maintenance': {
    id: 'how-to-create-maintenance',
    title: 'Comment planifier une maintenance',
    category: 'maintenance',
    readTime: 6,
    keywords: ['formulaire', 'maintenance', 'tâche', 'préventive', 'corrective', 'seuil', 'plan', 'récurrent'],
    tags: ['Maintenance', 'Formulaire', 'Préventif'],
    content: howToCreateMaintenance,
  },
  'how-to-create-point': {
    id: 'how-to-create-point',
    title: 'Comment créer un point à surveiller',
    category: 'surveillance',
    readTime: 4,
    keywords: ['formulaire', 'point', 'surveiller', 'observation', 'priorité', 'animal', 'champ'],
    tags: ['Surveillance', 'Formulaire', 'Observation'],
    content: howToCreatePoint,
  },
  'how-to-create-part': {
    id: 'how-to-create-part',
    title: 'Comment ajouter une pièce détachée',
    category: 'parts',
    readTime: 4,
    keywords: ['formulaire', 'pièce', 'stock', 'référence', 'compatibilité', 'fabricant'],
    tags: ['Stock', 'Pièces', 'Formulaire'],
    content: howToCreatePart,
  },
  'how-to-create-planning-task': {
    id: 'how-to-create-planning-task',
    title: 'Comment créer une tâche de planification',
    category: 'planning',
    readTime: 5,
    keywords: ['formulaire', 'planning', 'tâche', 'récurrence', 'priorité', 'catégorie', 'assignation'],
    tags: ['Planning', 'Formulaire', 'Quotidien'],
    content: howToCreatePlanningTask,
  },
  'how-to-track-time': {
    id: 'how-to-track-time',
    title: 'Comment suivre son temps de travail',
    category: 'time',
    readTime: 5,
    keywords: ['formulaire', 'temps', 'session', 'chrono', 'clôture', 'facturation', 'rapport'],
    tags: ['Temps', 'Formulaire', 'Facturation'],
    content: howToTrackTime,
  },
  'planning-task-time': {
    id: 'planning-task-time',
    title: 'Suivre le temps directement sur une tâche',
    category: 'planning',
    readTime: 3,
    keywords: ['chrono', 'session', 'pause', 'reprendre', 'terminer', 'temps', 'planning', 'tâche'],
    tags: ['Planning', 'Temps', 'Mobile'],
    content: planningTaskTime,
  },
};