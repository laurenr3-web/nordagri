# Agri ERP Insight

## À propos du projet

Agri ERP Insight est une application de gestion pour le secteur agricole permettant de suivre les équipements, la maintenance et les interventions.

## Mise en route

### Prérequis

- Node.js (v18+)
- npm ou bun

### Installation

Clonez le dépôt et installez les dépendances :

```sh
# Cloner le dépôt
git clone https://github.com/laurenr3-web/agri-erp-insight.git

# Naviguer dans le répertoire du projet
cd agri-erp-insight

# Installer les dépendances
npm install
# ou
bun install
```

### Développement

Pour lancer le serveur de développement :

```sh
npm run dev
# ou
bun dev
```

L'application sera accessible à l'adresse http://localhost:5173.

### Construction pour la production

```sh
npm run build
# ou
bun run build
```

## Modifications récentes

### 5 avril 2025

- Correction des conflits de dépendances ESLint (passage de v9 à v8)
- Mise à jour des fichiers de configuration ESLint
- Correction des problèmes de routage et de navigation
- Amélioration de la cohérence de l'interface utilisateur mobile

## Fonctionnalités principales

- Tableau de bord avec métriques essentielles
- Gestion des équipements agricoles
- Planification de la maintenance
- Suivi des interventions
- Gestion des pièces détachées
- QR Codes pour accès rapide aux informations d'équipement

## Technologies utilisées

Ce projet est construit avec :

- Vite
- TypeScript
- React
- React Router
- Supabase (Backend)
- shadcn-ui
- Tailwind CSS
- Recharts (visualisations)
- Sonner (notifications toast)
- React Query (gestion des requêtes)

## Structure du projet

- `/src` - Code source de l'application
  - `/components` - Composants réutilisables
  - `/pages` - Pages principales de l'application
  - `/hooks` - Hooks React personnalisés
  - `/services` - Services pour interagir avec les APIs
  - `/utils` - Fonctions utilitaires
  - `/types` - Définitions TypeScript

## Licence

Ce projet est sous licence privée.
