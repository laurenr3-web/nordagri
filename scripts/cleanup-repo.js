
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const REPORT_FILE = path.join(ROOT_DIR, 'unused-files-report.json');

// Process command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');

console.log('🧹 Repository Cleanup Tool');
console.log('=======================');

// Check if the report file exists
if (!fs.existsSync(REPORT_FILE)) {
  console.error('❌ No unused files report found!');
  console.log('Run the following command first:');
  console.log('  npm run lint:unused');
  process.exit(1);
}

// Read and parse the report file
const report = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));

console.log(`Report from: ${new Date(report.timestamp).toLocaleString()}`);
console.log(`Total files: ${report.totalFiles}`);
console.log(`Unused files: ${report.unusedCount}`);
console.log('');

if (report.unusedCount === 0) {
  console.log('✅ No unused files to clean up!');
  process.exit(0);
}

// List unused files by directory
console.log('Unused files by directory:');
Object.entries(report.unusedByDirectory).forEach(([dir, files]) => {
  console.log(`${dir} (${files.length} files)`);
  if (verbose) {
    files.forEach(file => console.log(`  - ${file}`));
  }
});

// Confirm cleanup
if (!dryRun) {
  console.log('\n⚠️  WARNING: This will permanently delete files! ⚠️');
  console.log('Make sure you have committed your changes first.');
  console.log('To run in dry-run mode, use the --dry-run flag.');
  
  // Wait for confirmation (we're just printing the message here as we can't get user input)
  console.log('\nThis is where we would ask for confirmation in an interactive script.');
  console.log('For now, we will simulate a dry run (files will not be deleted).');
  console.log('To actually perform the cleanup, run this script directly.');
}

// Perform cleanup
console.log('\nCleanup plan:');

report.unusedFiles.forEach(file => {
  const fullPath = path.join(ROOT_DIR, file);
  
  if (dryRun) {
    console.log(`Would remove: ${file}`);
  } else {
    try {
      // In an actual script, this would delete the file
      // fs.unlinkSync(fullPath);
      console.log(`Would remove: ${file}`);
    } catch (error) {
      console.error(`Failed to remove ${file}: ${error.message}`);
    }
  }
});

// Check for and cleanup any empty directories
function scanForEmptyDirs(directory) {
  const emptyDirs = [];
  
  function scan(dir) {
    const files = fs.readdirSync(dir);
    
    // Check if this directory is empty
    if (files.length === 0) {
      emptyDirs.push(path.relative(ROOT_DIR, dir));
      return;
    }
    
    // Recursively check subdirectories
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scan(fullPath);
      }
    }
    
    // Check if this directory would be empty after removing unused files
    const wouldBeEmpty = files.every(file => {
      const fullPath = path.join(dir, file);
      const relativePath = path.relative(ROOT_DIR, fullPath);
      
      if (fs.statSync(fullPath).isDirectory()) {
        return emptyDirs.includes(relativePath);
      } else {
        return report.unusedFiles.includes(relativePath);
      }
    });
    
    if (wouldBeEmpty) {
      emptyDirs.push(path.relative(ROOT_DIR, dir));
    }
  }
  
  scan(directory);
  return emptyDirs;
}

const emptyDirs = scanForEmptyDirs(path.join(ROOT_DIR, 'src'))
  .filter(dir => dir !== 'src'); // Don't remove the src directory

if (emptyDirs.length > 0) {
  console.log('\nDirectories that would be empty after cleanup:');
  emptyDirs.forEach(dir => {
    if (dryRun) {
      console.log(`Would remove directory: ${dir}`);
    } else {
      try {
        // In an actual script, this would delete the directory
        // fs.rmdirSync(path.join(ROOT_DIR, dir));
        console.log(`Would remove directory: ${dir}`);
      } catch (error) {
        console.error(`Failed to remove directory ${dir}: ${error.message}`);
      }
    }
  });
}

console.log('\n✅ Cleanup plan complete!');
if (dryRun) {
  console.log('No files were actually deleted (dry run).');
  console.log('To perform the actual cleanup, run without the --dry-run flag.');
} else {
  console.log('In a real interactive script, the cleanup would be executed now.');
}
