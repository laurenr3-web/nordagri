import type { HelpArticle } from './types';

import equipmentOrganize from './equipment-organize.md?raw';
import maintenanceSeasons from './maintenance-seasons.md?raw';
import partsStock from './parts-stock.md?raw';
import surveillanceVsIntervention from './surveillance-vs-intervention.md?raw';
import dailyPlanning from './daily-planning.md?raw';
import timeTracking from './time-tracking.md?raw';
import inviteMembers from './invite-members.md?raw';

export const helpArticles: Record<string, HelpArticle> = {
  'equipment-organize': {
    id: 'equipment-organize',
    title: 'Bien organiser sa flotte',
    category: 'equipment',
    readTime: 4,
    keywords: ['flotte', 'tracteur', 'équipement', 'organiser', 'inventaire'],
    content: equipmentOrganize,
  },
  'maintenance-seasons': {
    id: 'maintenance-seasons',
    title: 'Maintenance saison par saison',
    category: 'maintenance',
    readTime: 5,
    keywords: ['maintenance', 'préventive', 'saison', 'printemps', 'récolte', 'hiver'],
    content: maintenanceSeasons,
  },
  'parts-stock': {
    id: 'parts-stock',
    title: 'Réduire ses ruptures de pièces',
    category: 'parts',
    readTime: 4,
    keywords: ['pièces', 'stock', 'rupture', 'commande', 'inventaire'],
    content: partsStock,
  },
  'surveillance-vs-intervention': {
    id: 'surveillance-vs-intervention',
    title: 'Quand utiliser un point à surveiller vs une intervention',
    category: 'surveillance',
    readTime: 3,
    keywords: ['point', 'surveiller', 'intervention', 'observation'],
    content: surveillanceVsIntervention,
  },
  'daily-planning': {
    id: 'daily-planning',
    title: 'Maîtriser son planning quotidien',
    category: 'planning',
    readTime: 4,
    keywords: ['planning', 'tâche', 'récurrente', 'quotidien'],
    content: dailyPlanning,
  },
  'time-tracking': {
    id: 'time-tracking',
    title: 'Suivre le temps pour facturer ses prestations',
    category: 'time',
    readTime: 4,
    keywords: ['temps', 'session', 'facturation', 'ETA', 'coût'],
    content: timeTracking,
  },
  'invite-members': {
    id: 'invite-members',
    title: 'Inviter et gérer son équipe',
    category: 'team',
    readTime: 3,
    keywords: ['équipe', 'inviter', 'rôle', 'admin', 'membre'],
    content: inviteMembers,
  },
};