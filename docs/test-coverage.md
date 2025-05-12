
# Guide de la couverture de tests

## Vue d'ensemble
Ce document présente la stratégie de tests pour le projet Nordagri, identifie les zones actuellement testées, et recommande les tests additionnels à implémenter pour assurer une couverture minimale adéquate.

## Structure actuelle des tests
Les tests sont organisés dans le répertoire `/src/tests` et utilisent Vitest comme framework de test avec une configuration qui exige une couverture minimale de 80%.

### Tests existants
1. **Tests des équipements**
   - `equipmentUnit.test.ts` - Tests unitaires du service d'équipements
   - `equipment.test.ts` - Tests plus complets incluant le repository et les type guards

2. **Tests des logs carburant**
   - `fuelLog.test.ts` - Tests d'intégration pour les logs de carburant

3. **Tests du suivi de temps**
   - `timeTracking.test.ts` - Tests du service de suivi de temps

## Zones non testées critiques

### Fonctionnalité de tableau de bord
- Hook principal `useDashboardData`
- Hooks spécifiques pour les statistiques, équipements, et alertes

### Fonctionnalité de maintenance
- Logique de filtrage dans `useMaintenanceContent`
- Gestion des tâches et affichage

### Fonctionnalité de suivi de temps
- Hooks comme `useTimeTracking` et `useTimeTrackingData`
- Composants UI comme `TimeTrackingButton`

### Gestion des pièces
- Hooks comme `usePartsData` et tests CRUD

### Services Supabase
- Requêtes et mutations dans des fichiers comme `queries.ts`

## Stratégie de test recommandée

### Couverture minimale

Pour assurer une robustesse minimale du système, nous recommandons d'implémenter au moins les tests suivants:

1. **Tests unitaires des hooks critiques**
   - `useDashboardData.test.ts` - Tester l'agrégation des données du tableau de bord
   - `useTimeTracking.test.ts` - Tester les opérations de suivi du temps
   - `useMaintenanceContent.test.ts` - Tester le filtrage et l'affichage des tâches

2. **Tests d'intégration pour les services Supabase**
   - `queries.test.ts` - Tester les opérations CRUD sur les équipements
   - `usePartsData.test.ts` - Tester la récupération et la manipulation des pièces

3. **Tests de composants UI critiques**
   - Tester les composants de maintenance et de suivi du temps
   - Tester les tableaux de bord et les affichages récapitulatifs

### Types de tests à privilégier

1. **Tests unitaires**
   - Tester les fonctions pures et hooks en isolation
   - Vérifier les transformations de données et la logique métier

2. **Tests d'intégration**
   - Tester l'interaction avec Supabase
   - Vérifier les flux de données entre les hooks et services

3. **Tests de composants**
   - Tester le rendu et le comportement des composants UI critiques
   - Vérifier les interactions utilisateur et les mises à jour d'état

## Meilleures pratiques

1. **Mocking efficace**
   - Utiliser `vi.mock()` pour les dépendances externes
   - Isoler les tests pour éviter les effets de bord

2. **Tests centrés sur les utilisateurs**
   - Tester les parcours utilisateurs critiques
   - Vérifier les comportements plutôt que l'implémentation

3. **Tests de régression**
   - Ajouter des tests pour les bugs découverts
   - Vérifier que les correctifs n'introduisent pas de nouveaux problèmes

4. **Maintenance des tests**
   - Revoir régulièrement les tests pour s'assurer qu'ils suivent l'évolution du code
   - Refactorer les tests redondants ou obsolètes

## Outils d'analyse

Le script `scripts/analyze-coverage.js` peut être utilisé pour identifier les fichiers avec une faible couverture de tests. Exécutez-le après les tests pour obtenir un rapport sur les zones nécessitant plus de tests.

## Plan d'amélioration progressive

1. **Court terme**
   - Implémenter les tests critiques décrits dans la section "Couverture minimale"
   - Corriger les tests défaillants existants

2. **Moyen terme**
   - Étendre la couverture aux composants UI et aux fonctionnalités secondaires
   - Automatiser les tests dans le pipeline CI/CD

3. **Long terme**
   - Atteindre une couverture de 80% sur l'ensemble du code
   - Implémenter des tests end-to-end pour les parcours utilisateurs critiques
