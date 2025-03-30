
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const isVerbose = args.includes('--verbose');
const checkAll = args.includes('--all');

// Get only changed TypeScript files to improve performance (unless --all is specified)
function getChangedTypeScriptFiles() {
  if (checkAll) {
    return [];  // Empty array will cause tsc to check all files
  }
  
  try {
    // Get files changed since last commit
    const gitOutput = execSync('git diff --name-only HEAD').toString().trim();
    const files = gitOutput.split('\n').filter(file => 
      file.endsWith('.ts') || file.endsWith('.tsx')
    );
    
    if (isVerbose) {
      console.log('Changed TypeScript files:');
      files.forEach(file => console.log(`- ${file}`));
    }
    
    return files;
  } catch (error) {
    console.warn('Unable to get git diff. Checking all files instead.');
    return [];
  }
}

console.log('Running TypeScript type checking...');

try {
  // Create a temporary tsconfig if checking specific files
  const changedFiles = getChangedTypeScriptFiles();
  let command = 'npx tsc --noEmit';
  
  if (changedFiles.length > 0) {
    // Only check changed files for faster feedback
    command += ` ${changedFiles.join(' ')}`;
    console.log(`Checking ${changedFiles.length} changed files`);
  } else {
    console.log('Checking all TypeScript files');
  }
  
  // Add fix flag if requested
  if (shouldFix) {
    command += ' --fix';
  }
  
  // Run TypeScript compiler
  execSync(command, { stdio: 'inherit' });
  console.log('✅ Type checking passed successfully!');
  
  // Additional optional checks
  if (isVerbose) {
    console.log('\nRunning interface contract validations...');
    // This could check for correct implementation of interfaces, etc.
    // For now, we're just checking if the equipment contract is imported and used correctly
    
    const contractUsage = execSync('grep -r "import.*EquipmentData" --include="*.ts" --include="*.tsx" src/ | wc -l').toString().trim();
    console.log(`EquipmentData contract is imported in ${contractUsage} files`);
  }
  
} catch (error) {
  console.error('❌ Type checking failed. Please fix the errors above.');
  
  if (shouldFix) {
    console.log('\nAttempting to fix common type issues...');
    // We could add automatic fixes for common issues here
    console.log('Note: Automatic fixing is limited. Please review errors manually.');
  }
  
  process.exit(1);
}
