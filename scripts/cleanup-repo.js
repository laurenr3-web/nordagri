
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
const forceCleanup = args.includes('--force');
const createBackup = args.includes('--backup');

/**
 * Logs a message to the console
 * @param {string} message - The message to log
 * @param {string} [type='log'] - The type of log (log, error, warn)
 */
function log(message, type = 'log') {
  console[type](message);
}

/**
 * Checks if the report file exists and is valid
 * @returns {Object|null} - The parsed report or null if invalid
 */
function validateReportFile() {
  try {
    if (!fs.existsSync(REPORT_FILE)) {
      log('❌ No unused files report found!', 'error');
      log('Run the following command first:');
      log('  npm run lint:unused');
      return null;
    }

    const report = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));
    
    // Validate report structure
    if (!report.timestamp || !report.unusedFiles || !Array.isArray(report.unusedFiles)) {
      log('❌ Invalid report format!', 'error');
      return null;
    }
    
    return report;
  } catch (error) {
    log(`❌ Error reading report file: ${error.message}`, 'error');
    return null;
  }
}

/**
 * Displays report summary information
 * @param {Object} report - The parsed report object
 */
function displayReportSummary(report) {
  log('🧹 Repository Cleanup Tool');
  log('=======================');
  
  log(`Report from: ${new Date(report.timestamp).toLocaleString()}`);
  log(`Total files: ${report.totalFiles}`);
  log(`Unused files: ${report.unusedCount}`);
  log('');

  if (report.unusedCount === 0) {
    log('✅ No unused files to clean up!');
    return false;
  }
  
  return true;
}

/**
 * Lists unused files by directory
 * @param {Object} report - The parsed report object
 */
function listUnusedFiles(report) {
  log('Unused files by directory:');
  Object.entries(report.unusedByDirectory).forEach(([dir, files]) => {
    log(`${dir} (${files.length} files)`);
    if (verbose) {
      files.forEach(file => log(`  - ${file}`));
    }
  });
}

/**
 * Creates a Git backup branch before cleanup
 * @returns {boolean} - Whether backup was successful
 */
function createGitBackup() {
  try {
    log('\nCreating Git backup before cleanup...');
    const backupBranch = `cleanup-backup-${Date.now()}`;
    
    execSync(`git checkout -b ${backupBranch}`, { stdio: 'pipe' });
    execSync('git add -A', { stdio: 'pipe' });
    execSync(`git commit -m "Backup before cleanup"`, { stdio: 'pipe' });
    execSync('git checkout -', { stdio: 'pipe' });
    
    log(`✅ Backup created in branch: ${backupBranch}`);
    return true;
  } catch (error) {
    log(`❌ Failed to create Git backup: ${error.message}`, 'error');
    log('Continuing without backup...');
    return false;
  }
}

/**
 * Confirms cleanup with user (simulated in this script)
 * @returns {boolean} - Whether user confirmed
 */
function confirmCleanup() {
  if (forceCleanup) {
    return true;
  }
  
  if (!dryRun) {
    log('\n⚠️  WARNING: This will permanently delete files! ⚠️');
    log('Make sure you have committed your changes first.');
    log('To run in dry-run mode, use the --dry-run flag.');
    
    log('\nThis is where we would ask for confirmation in an interactive script.');
    log('For now, we will simulate a dry run (files will not be deleted).');
    log('To perform the actual cleanup, run with the --force flag.');
    return false;
  }
  
  return false;
}

/**
 * Remove a file from the filesystem
 * @param {string} file - The file to remove
 * @returns {boolean} - Whether removal was successful
 */
function removeFile(file) {
  const fullPath = path.join(ROOT_DIR, file);
  
  if (dryRun) {
    log(`Would remove: ${file}`);
    return true;
  }
  
  try {
    fs.unlinkSync(fullPath);
    log(`✅ Removed: ${file}`);
    return true;
  } catch (error) {
    log(`❌ Failed to remove ${file}: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Scans for directories that would be empty after removing unused files
 * @param {string} directory - The directory to scan
 * @param {string[]} unusedFiles - Array of files to be removed
 * @returns {string[]} - Array of empty directory paths
 */
function scanForEmptyDirs(directory, unusedFiles) {
  const emptyDirs = [];
  
  function scan(dir) {
    try {
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
          return unusedFiles.includes(relativePath);
        }
      });
      
      if (wouldBeEmpty) {
        emptyDirs.push(path.relative(ROOT_DIR, dir));
      }
    } catch (error) {
      log(`Error scanning directory ${dir}: ${error.message}`, 'error');
    }
  }
  
  scan(directory);
  return emptyDirs.filter(dir => dir !== 'src'); // Don't remove the src directory
}

/**
 * Removes empty directories
 * @param {string[]} emptyDirs - Array of empty directory paths
 */
function removeEmptyDirectories(emptyDirs) {
  if (emptyDirs.length === 0) {
    return;
  }
  
  log('\nDirectories that would be empty after cleanup:');
  
  // Sort directories by depth (deepest first) to ensure proper removal
  const sortedDirs = emptyDirs.sort((a, b) => {
    return b.split(path.sep).length - a.split(path.sep).length;
  });
  
  sortedDirs.forEach(dir => {
    if (dryRun) {
      log(`Would remove directory: ${dir}`);
    } else {
      try {
        fs.rmdirSync(path.join(ROOT_DIR, dir));
        log(`✅ Removed directory: ${dir}`);
      } catch (error) {
        log(`❌ Failed to remove directory ${dir}: ${error.message}`, 'error');
      }
    }
  });
}

/**
 * Main function to perform cleanup
 */
function performCleanup() {
  try {
    const report = validateReportFile();
    if (!report) {
      process.exit(1);
    }
    
    const hasUnusedFiles = displayReportSummary(report);
    if (!hasUnusedFiles) {
      process.exit(0);
    }
    
    listUnusedFiles(report);
    
    // Create Git backup if requested
    if (createBackup && !dryRun) {
      createGitBackup();
    }
    
    // Confirm cleanup with user
    const shouldProceed = confirmCleanup();
    
    log('\nCleanup plan:');
    
    // Remove unused files
    report.unusedFiles.forEach(file => {
      removeFile(file);
    });
    
    // Check for and cleanup empty directories
    const emptyDirs = scanForEmptyDirs(path.join(ROOT_DIR, 'src'), report.unusedFiles);
    removeEmptyDirectories(emptyDirs);
    
    log('\n✅ Cleanup plan complete!');
    if (dryRun) {
      log('No files were actually deleted (dry run).');
      log('To perform the actual cleanup, run with the --force flag.');
    } else if (!shouldProceed) {
      log('Only showing cleanup plan. No files were actually deleted.');
      log('To perform the actual cleanup, run with the --force flag.');
    } else {
      log('Cleanup completed successfully!');
    }
  } catch (error) {
    log(`Critical error: ${error.message}`, 'error');
    log(error.stack, 'error');
    process.exit(1);
  }
}

// Run the cleanup
performCleanup();
