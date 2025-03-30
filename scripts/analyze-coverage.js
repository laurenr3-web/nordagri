
const fs = require('fs');
const path = require('path');

// Lire le rapport de couverture généré par vitest
const coverageReport = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../coverage/coverage-summary.json'), 'utf8')
);

// Analyser les fichiers avec faible couverture
const lowCoverageFiles = [];
Object.entries(coverageReport).forEach(([file, coverage]) => {
  if (file === 'total') return;
  
  if (coverage.statements.pct < 70 || coverage.branches.pct < 70) {
    lowCoverageFiles.push({
      file,
      statements: coverage.statements.pct,
      branches: coverage.branches.pct
    });
  }
});

console.log('Files with low test coverage:');
lowCoverageFiles.forEach(file => {
  console.log(`${file.file}: Statements: ${file.statements}%, Branches: ${file.branches}%`);
});
