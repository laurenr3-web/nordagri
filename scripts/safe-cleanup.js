
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { generateJsonReport } = require('./analyze-imports');

// Configuration
const BACKUP_BRANCH = 'backup-before-cleanup';
const TRASH_DIR = path.join(__dirname, '../.trash');

// Créer un dossier poubelle pour stocker les fichiers supprimés temporairement
if (!fs.existsSync(TRASH_DIR)) {
  fs.mkdirSync(TRASH_DIR, { recursive: true });
}

// Récupérer le rapport d'analyse
console.log('Analyzing project for unused files...');
const report = generateJsonReport();

if (report.unusedFiles.length === 0) {
  console.log('No unused files found. Your project is clean!');
  process.exit(0);
}

// Afficher les fichiers à supprimer
console.log(`Found ${report.unusedFiles.length} unused files out of ${report.totalFiles} total files.`);

// Créer une branche de sauvegarde
try {
  console.log(`Creating backup branch '${BACKUP_BRANCH}'...`);
  execSync(`git checkout -b ${BACKUP_BRANCH}`);
  execSync('git add -A');
  execSync('git commit -m "Backup before code cleanup"');
  execSync('git checkout -'); // Retour à la branche précédente
  console.log('Backup created successfully.');
} catch (error) {
  console.error('Error creating backup branch:', error.message);
  console.log('Continuing without git backup. Files will still be moved to .trash/');
}

// Fonction pour déplacer un fichier vers la poubelle
function moveToTrash(filePath) {
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  const trashPath = path.join(TRASH_DIR, relativePath);
  
  // Créer le répertoire parent dans .trash si nécessaire
  const trashDir = path.dirname(trashPath);
  if (!fs.existsSync(trashDir)) {
    fs.mkdirSync(trashDir, { recursive: true });
  }
  
  // Déplacer le fichier
  try {
    fs.renameSync(filePath, trashPath);
    return true;
  } catch (error) {
    console.error(`Error moving ${filePath} to trash:`, error.message);
    return false;
  }
}

// Mode interactif ou automatique
const args = process.argv.slice(2);
const isAutomaticMode = args.includes('--auto');

if (isAutomaticMode) {
  // Mode automatique - déplacer tous les fichiers vers la poubelle
  console.log('Running in automatic mode. Moving all unused files to trash...');
  let successCount = 0;
  
  report.unusedFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (moveToTrash(fullPath)) {
      successCount++;
      console.log(`Moved to trash: ${file}`);
    }
  });
  
  console.log(`Cleanup complete. ${successCount}/${report.unusedFiles.length} files moved to .trash/`);
  console.log('To restore files, move them back from the .trash/ directory or use git to restore from the backup branch.');
} else {
  // Mode interactif - demander confirmation pour chaque fichier
  console.log('Running in interactive mode. Please confirm each file to move to trash.');
  console.log('Press Y to move, N to keep, A to move all remaining, Q to quit.');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  let currentIndex = 0;
  
  function processNextFile() {
    if (currentIndex >= report.unusedFiles.length) {
      rl.close();
      console.log('Cleanup complete.');
      return;
    }
    
    const file = report.unusedFiles[currentIndex];
    const fullPath = path.join(__dirname, '..', file);
    
    rl.question(`Move to trash: ${file}? [Y/N/A/Q] `, answer => {
      if (answer.toLowerCase() === 'q') {
        rl.close();
        console.log('Cleanup cancelled.');
        return;
      }
      
      if (answer.toLowerCase() === 'a') {
        // Move all remaining files
        for (let i = currentIndex; i < report.unusedFiles.length; i++) {
          const remainingFile = report.unusedFiles[i];
          const remainingPath = path.join(__dirname, '..', remainingFile);
          if (moveToTrash(remainingPath)) {
            console.log(`Moved to trash: ${remainingFile}`);
          }
        }
        rl.close();
        console.log('Cleanup complete.');
        return;
      }
      
      if (answer.toLowerCase() === 'y') {
        if (moveToTrash(fullPath)) {
          console.log(`Moved to trash: ${file}`);
        }
      }
      
      currentIndex++;
      processNextFile();
    });
  }
  
  processNextFile();
}
