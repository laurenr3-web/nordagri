
# Architecture de l'Application

## Vue d'ensemble
OptiField est une application de gestion d'équipements agricoles qui utilise une architecture moderne basée sur React et Supabase.

## Couches architecturales
L'application suit une architecture en couches clairement séparées:

1. **Couche de Présentation** (`/src/components`)
   - Interface utilisateur React
   - Composants UI réutilisables
   - Vues spécifiques aux fonctionnalités

2. **Couche de Logique Métier** (`/src/hooks`)
   - Hooks personnalisés pour la logique d'affaires
   - Gestion d'état et interactions
   - Validation des données

3. **Couche de Services** (`/src/services`)
   - Communication avec les API externes
   - Services d'intégration Supabase
   - Services utilitaires

4. **Couche de Données** (`/src/data`)
   - Modèles de données
   - Repositories
   - Adaptateurs pour les sources de données

## Flux de données
```
[UI Components] → [Hooks] → [Services] → [Data Layer] → [Supabase]
       ↑                                       |
       └───────────────────────────────────────┘
```

## Principes de conception
1. **Séparation des préoccupations** - Chaque module a une responsabilité unique et bien définie
2. **Indépendance des couches** - Les couches inférieures ne dépendent pas des couches supérieures
3. **Isolation de l'API externe** - Les détails de l'API sont isolés dans la couche d'adaptateurs
4. **Modèle de données unifié** - Un seul modèle de données est utilisé dans toute l'application

## Gestion d'état
- Utilisation de React Query pour la gestion des données distantes
- Hooks React pour la gestion d'état local
- Context API pour l'état global partagé

## Gestion des données en temps réel
L'application utilise les capacités temps réel de Supabase pour:
- Mise à jour des équipements en temps réel
- Suivi des interventions
- Notifications de maintenance
