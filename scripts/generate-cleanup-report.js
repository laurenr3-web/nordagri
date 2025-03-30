
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Lire le rapport JSON des fichiers non utilisés
const result = execSync('node scripts/analyze-imports.js --json', { encoding: 'utf8' });
const report = JSON.parse(result);

// Générer un rapport Markdown
const reportContent = `# Rapport de nettoyage de code - ${new Date().toLocaleDateString()}

## Résumé
- **Fichiers totaux**: ${report.totalFiles}
- **Fichiers utilisés**: ${report.usedFiles}
- **Fichiers non utilisés**: ${report.unusedFiles.length}
- **Taux d'utilisation**: ${Math.round((report.usedFiles / report.totalFiles) * 100)}%

## Répartition par dossier
${Object.entries(report.unusedByDir)
  .sort((a, b) => b[1].length - a[1].length)
  .map(([dir, files]) => `- **${dir}**: ${files.length} fichier(s)`)
  .join('\n')}

## Liste des fichiers non utilisés
${report.unusedFiles.map(file => `- \`${file}\``).join('\n')}

## Recommandations
- Vérifiez que ces fichiers ne sont pas utilisés dynamiquement
- Exécutez la commande \`npm run cleanup\` pour un nettoyage interactif
- Ou utilisez \`npm run cleanup:auto\` pour un nettoyage automatisé
- Les fichiers supprimés seront placés dans le dossier \`.trash\` pour récupération si nécessaire
- Une branche Git de sauvegarde \`backup-before-cleanup\` sera créée avant la suppression

## Métrique de qualité
Score de propreté du code: **${Math.round((report.usedFiles / report.totalFiles) * 100)}%**

> Rapport généré automatiquement. Vérifiez soigneusement avant de procéder au nettoyage.
`;

// Écrire le rapport dans un fichier
const reportPath = path.join(__dirname, '../cleanup-report.md');
fs.writeFileSync(reportPath, reportContent);

console.log(`Rapport de nettoyage généré: ${reportPath}`);
