
# Repository Cleanup Guide

Ce document contient des instructions pour nettoyer le dépôt en éliminant les fichiers et dossiers non utilisés ainsi que pour améliorer la qualité du code.

## Scripts recommandés pour package.json

Ajoutez ces scripts à votre fichier `package.json` pour simplifier l'utilisation des outils de nettoyage:

```json
{
  "scripts": {
    "analyze": "node scripts/analyze-imports.js --report",
    "analyze:json": "node scripts/analyze-imports.js --json",
    "cleanup": "node scripts/safe-cleanup.js",
    "cleanup:auto": "node scripts/safe-cleanup.js --auto",
    "precleanup": "npm run test",
    "postcleanup": "npm run build"
  }
}
```

## Commandes disponibles

### Analyse des imports

```bash
# Analyser les imports et afficher les fichiers non utilisés
npm run lint:unused

# Générer un rapport détaillé des fichiers non utilisés
npm run analyze

# Générer un rapport JSON des fichiers non utilisés
npm run analyze:json

# Supprimer automatiquement les fichiers non utilisés (ATTENTION: destructif)
npm run cleanup

# Supprimer automatiquement les fichiers non utilisés sans confirmation
npm run cleanup:auto
```

### Vérification des types

```bash
# Vérifier les types TypeScript
npm run type-check

# Vérifier uniquement les fichiers modifiés
npm run type-check 

# Vérifier tous les fichiers
npm run type-check -- --all

# Mode verbeux avec informations détaillées
npm run type-check -- --verbose
```

### Validation complète

```bash
# Exécuter toutes les vérifications (types + linting + imports)
npm run validate
```

## Étape 1: Analyser les imports

Exécutez le script d'analyse pour identifier les fichiers potentiellement non utilisés:

```bash
npm run analyze
```

Ce script analysera l'arborescence des imports à partir des points d'entrée de l'application et identifiera les fichiers qui ne sont pas importés.

### Options avancées

- `--report`: Génère un rapport JSON détaillé des fichiers non utilisés
- `--quiet`: Mode silencieux qui n'affiche pas les détails
- `--clean`: Supprime automatiquement les fichiers non utilisés (ATTENTION: à utiliser avec précaution)

## Étape 2: Identifier les fichiers essentiels

Les fichiers suivants sont essentiels pour l'application et ne doivent pas être supprimés même s'ils ne sont pas directement importés:

- Tous les fichiers importés directement ou indirectement depuis `src/main.tsx` et `src/App.tsx`
- Les composants utilisés dans les routes actives (vérifiez `App.tsx` et les fichiers des routes)
- Les types et interfaces utilisés à travers l'application
- Hooks et utilitaires qui sont importés par d'autres fichiers
- Fichiers chargés dynamiquement (qui peuvent ne pas être détectés par l'analyse statique)

## Étape 3: Supprimer les fichiers et dossiers inutilisés

Une fois que vous avez vérifié quels fichiers peuvent être supprimés en toute sécurité:

1. Faites une sauvegarde (commit) de l'état actuel du projet
2. Exécutez le script de nettoyage avec l'option dry-run:

```bash
npm run cleanup
```

3. Vérifiez la liste des fichiers qui seraient supprimés
4. Si tout semble correct, exécutez le nettoyage automatique:

```bash
npm run cleanup:auto
```

5. Vérifiez que l'application compile et fonctionne correctement

## Étape 4: Nettoyage des dépendances

Pour nettoyer les dépendances inutilisées, vous pouvez utiliser:

```bash
npx depcheck
```

## Vérification des types TypeScript

Le script de vérification des types permet de s'assurer que tous les types TypeScript sont valides:

```bash
npm run type-check
```

Ce script peut être configuré pour vérifier uniquement les fichiers modifiés pour accélérer le processus.

## Validation continue

Pour intégrer ces vérifications dans le processus de développement continu, ces scripts peuvent être:

1. Exécutés avant chaque commit via un hook pre-commit
2. Intégrés dans le pipeline CI/CD
3. Configurés pour s'exécuter automatiquement avant chaque build de production

## Structure actuelle du projet

Les dossiers principaux actifs dans le projet sont:

- `src/components`: Composants React utilisés dans l'application
- `src/hooks`: Hooks React personnalisés
- `src/integrations`: Intégrations avec des services externes comme Supabase
- `src/services`: Services pour interagir avec l'API backend
- `src/pages`: Pages/Routes de l'application
- `src/types`: Définitions de types TypeScript
- `src/contracts`: Contrats d'interface pour les données partagées

## Nettoyage recommandé

Basé sur l'analyse automatique, voici les types de fichiers qui sont généralement candidats à la suppression:

1. Les fichiers dans `src/components` qui ne sont pas importés par d'autres fichiers
2. Les hooks non utilisés dans `src/hooks`
3. Les services non utilisés dans `src/services`
4. Les types non référencés dans `src/types`
5. Les composants dupliqués ou obsolètes

Rappelez-vous de toujours faire une sauvegarde avant de supprimer quoi que ce soit et de tester l'application après chaque modification majeure.
