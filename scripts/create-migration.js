
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Création du nom de fichier avec horodatage
const now = new Date();
const timestamp = now.getFullYear().toString() + 
                 (now.getMonth() + 1).toString().padStart(2, '0') + 
                 now.getDate().toString().padStart(2, '0') +
                 now.getHours().toString().padStart(2, '0') + 
                 now.getMinutes().toString().padStart(2, '0') +
                 now.getSeconds().toString().padStart(2, '0');

// Récupérer la description depuis les arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Erreur: Vous devez fournir une description pour la migration');
  console.log('Exemple: node create-migration.js add_user_column');
  process.exit(1);
}

const description = args[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase();
const fileName = `${timestamp}_${description}.sql`;
const migrationDir = path.join(__dirname, '..', 'supabase', 'migrations');

// Créer le dossier migrations s'il n'existe pas
if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir, { recursive: true });
}

// Contenu du fichier de migration
const content = `-- Migration: ${description}
-- Created at: ${now.toISOString()}

-- Vos instructions SQL ici

-- Ne pas oublier d'enregistrer la migration
INSERT INTO migrations (name) VALUES ('${fileName.replace('.sql', '')}');
`;

// Écriture du fichier
const filePath = path.join(migrationDir, fileName);
fs.writeFileSync(filePath, content);

console.log(`Migration créée: ${filePath}`);
