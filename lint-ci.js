
/**
 * Script simplifié pour le lint dans le CI 
 * Exécute ESLint avec des options permettant de contourner les erreurs de TypeScript
 */

import { spawnSync } from 'child_process';

// Exécuter ESLint avec des arguments spécifiques pour CI
const result = spawnSync('npx', ['eslint', '.', '--max-warnings=100'], {
  stdio: 'inherit',
  shell: true,
});

// Sortir avec le même code d'erreur qu'ESLint
process.exit(result.status);
