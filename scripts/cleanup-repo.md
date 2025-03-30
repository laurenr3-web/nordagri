
# Repository Cleanup Guide

Ce document contient des instructions pour nettoyer le dépôt en éliminant les fichiers et dossiers non utilisés.

## Étape 1: Analyser les imports

Exécutez le script d'analyse pour identifier les fichiers potentiellement non utilisés:

```bash
node scripts/analyze-imports.js
```

## Étape 2: Identifier les fichiers essentiels

Les fichiers suivants sont essentiels pour l'application et ne doivent pas être supprimés:

- Tous les fichiers importés directement ou indirectement depuis `src/main.tsx` et `src/App.tsx`
- Les composants utilisés dans les routes actives (vérifiez `App.tsx` et les fichiers des routes)
- Les types et interfaces utilisés à travers l'application
- Hooks et utilitaires qui sont importés par d'autres fichiers

## Étape 3: Supprimer les fichiers et dossiers inutilisés

Une fois que vous avez vérifié quels fichiers peuvent être supprimés en toute sécurité:

1. Faites une sauvegarde (commit) de l'état actuel du projet
2. Supprimez les fichiers identifiés comme non utilisés
3. Vérifiez que l'application compile et fonctionne correctement
4. Supprimez les dossiers vides

## Étape 4: Nettoyage des dépendances

Pour nettoyer les dépendances inutilisées, vous pouvez utiliser:

```bash
npx depcheck
```

## Remarques importantes

- Certains fichiers peuvent sembler inutilisés mais être chargés dynamiquement
- Les fichiers avec extension `.d.ts` sont des fichiers de définition de types et sont généralement importants
- Les composants utilisés uniquement avec des imports dynamiques peuvent apparaître comme non utilisés
- Vérifiez toujours que l'application fonctionne correctement après chaque suppression

## Structure actuelle du projet

Les dossiers principaux actifs dans le projet sont:

- `src/components`: Composants React utilisés dans l'application
- `src/hooks`: Hooks React personnalisés
- `src/integrations`: Intégrations avec des services externes comme Supabase
- `src/services`: Services pour interagir avec l'API backend
- `src/pages`: Pages/Routes de l'application
- `src/types`: Définitions de types TypeScript

## Nettoyage recommandé

Basé sur l'analyse, voici les dossiers qui semblent peu ou pas utilisés et qui pourraient être candidats à la suppression (à vérifier manuellement):

1. Les fichiers dans `src/components` qui ne sont pas importés par d'autres fichiers
2. Les hooks non utilisés dans `src/hooks`
3. Les services non utilisés dans `src/services`
4. Les types non référencés

Rappelez-vous de toujours faire une sauvegarde avant de supprimer quoi que ce soit et de tester l'application après chaque modification majeure.
