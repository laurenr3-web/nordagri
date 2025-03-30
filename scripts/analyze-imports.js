
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Process command line arguments
const args = process.argv.slice(2);
const shouldGenerateReport = args.includes('--report');
const shouldCleanup = args.includes('--clean');
const isQuiet = args.includes('--quiet');
const outputJson = args.includes('--json');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const REPORT_FILE = path.join(ROOT_DIR, 'unused-files-report.json');
const ENTRY_POINTS = ['src/main.tsx', 'src/App.tsx'];

// State tracking
const allFiles = new Map();
const importedFiles = new Set();

/**
 * Logs a message to the console if not in quiet mode
 * @param {string} message - The message to log
 * @param {string} [type='log'] - The type of log (log, error, warn)
 */
function log(message, type = 'log') {
  if (!isQuiet) {
    console[type](message);
  }
}

/**
 * Collects all source files in the specified directory
 * @param {string} dir - The directory to scan
 */
function collectFiles(dir) {
  try {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
      const fullPath = path.join(dir, dirent.name);
      const relativePath = path.relative(ROOT_DIR, fullPath);
      
      if (dirent.isDirectory()) {
        collectFiles(fullPath);
      } else if (EXTENSIONS.includes(path.extname(dirent.name))) {
        allFiles.set(relativePath, { used: false, importedBy: [] });
      }
    });
  } catch (error) {
    log(`Error collecting files in ${dir}: ${error.message}`, 'error');
  }
}

/**
 * Resolves an import path to an absolute file path
 * @param {string} importPath - The import path from the code
 * @param {string} sourceFilePath - The file that contains the import
 * @returns {string|null} - The resolved absolute path or null if not found
 */
function resolveImportPath(importPath, sourceFilePath) {
  try {
    // Skip external packages
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      return null;
    }
    
    // Resolve the absolute path
    let absoluteImportPath;
    if (importPath.startsWith('@/')) {
      // Handle alias
      absoluteImportPath = path.join(SRC_DIR, importPath.slice(2));
    } else {
      // Handle relative imports
      absoluteImportPath = path.resolve(path.dirname(sourceFilePath), importPath);
    }
    
    // Add extensions if needed and check if file exists
    if (fs.existsSync(absoluteImportPath)) {
      return absoluteImportPath;
    }
    
    // Try with extensions
    for (const ext of EXTENSIONS) {
      const pathWithExt = `${absoluteImportPath}${ext}`;
      if (fs.existsSync(pathWithExt)) {
        return pathWithExt;
      }
      
      // Check index files
      const indexPath = path.join(absoluteImportPath, `index${ext}`);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }
    
    return null;
  } catch (error) {
    log(`Error resolving import path ${importPath}: ${error.message}`, 'error');
    return null;
  }
}

/**
 * Analyzes imports in a file and tracks dependencies
 * @param {string} filePath - The file to analyze
 */
function analyzeImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+[^;]+|[^;{]*)\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      const resolvedPath = resolveImportPath(importPath, filePath);
      
      if (resolvedPath) {
        const relativeToRoot = path.relative(ROOT_DIR, resolvedPath);
        importedFiles.add(relativeToRoot);
        
        // Track which files import this file
        if (allFiles.has(relativeToRoot)) {
          const fileInfo = allFiles.get(relativeToRoot);
          fileInfo.used = true;
          fileInfo.importedBy.push(path.relative(ROOT_DIR, filePath));
          allFiles.set(relativeToRoot, fileInfo);
        }
      }
    }
  } catch (error) {
    log(`Error analyzing imports in ${filePath}: ${error.message}`, 'error');
  }
}

/**
 * Generates a JSON report of unused files
 * @param {Array} unusedFiles - Array of unused file entries
 * @returns {Object} - The report object
 */
function generateReport(unusedFiles) {
  try {
    const report = {
      timestamp: new Date().toISOString(),
      totalFiles: allFiles.size,
      unusedCount: unusedFiles.length,
      unusedFiles: unusedFiles.map(([file]) => file),
      unusedByDirectory: {}
    };
    
    // Group by directory
    unusedFiles.forEach(([file]) => {
      const dir = path.dirname(file);
      if (!report.unusedByDirectory[dir]) {
        report.unusedByDirectory[dir] = [];
      }
      report.unusedByDirectory[dir].push(file);
    });
    
    fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
    log(`Report generated at ${REPORT_FILE}`);
    
    return report;
  } catch (error) {
    log(`Error generating report: ${error.message}`, 'error');
    return {
      timestamp: new Date().toISOString(),
      error: error.message,
      totalFiles: allFiles.size,
      unusedCount: 0,
      unusedFiles: [],
      unusedByDirectory: {}
    };
  }
}

/**
 * Removes a file from the filesystem
 * @param {string} file - Relative path to the file
 * @returns {boolean} - Whether removal was successful
 */
function removeFile(file) {
  try {
    const fullPath = path.join(ROOT_DIR, file);
    fs.unlinkSync(fullPath);
    log(`✅ Removed: ${file}`);
    return true;
  } catch (error) {
    log(`❌ Failed to remove ${file}: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Suggests or performs cleanup actions
 * @param {Array} unusedFiles - Array of unused file entries
 */
function suggestCleanup(unusedFiles) {
  if (shouldCleanup) {
    log('\nCleanup actions:');
    log('⚠️  This is a destructive operation. Make sure to commit your changes first!');
    
    unusedFiles.forEach(([file]) => {
      if (shouldCleanup) {
        removeFile(file);
      } else {
        log(`rm "${file}"`);
      }
    });
    
    // Clean up empty directories
    cleanupEmptyDirs(SRC_DIR);
  }
}

/**
 * Recursively removes empty directories
 * @param {string} directory - The directory to check
 * @returns {boolean} - Whether the directory was empty and removed
 */
function cleanupEmptyDirs(directory) {
  try {
    const files = fs.readdirSync(directory);
    
    if (files.length === 0) {
      const relativePath = path.relative(ROOT_DIR, directory);
      // Don't remove the src directory
      if (relativePath !== 'src') {
        try {
          fs.rmdirSync(directory);
          if (!isQuiet && shouldCleanup) {
            log(`✅ Removed empty directory: ${relativePath}`);
          }
          return true;
        } catch (error) {
          log(`❌ Failed to remove directory ${relativePath}: ${error.message}`, 'error');
          return false;
        }
      }
    }
    
    // Process subdirectories
    let anyRemoved = false;
    for (const file of files) {
      const filePath = path.join(directory, file);
      if (fs.statSync(filePath).isDirectory()) {
        const removed = cleanupEmptyDirs(filePath);
        anyRemoved = anyRemoved || removed;
      }
    }
    
    // Check if directory is empty now, after processing subdirectories
    if (anyRemoved) {
      const remainingFiles = fs.readdirSync(directory);
      if (remainingFiles.length === 0) {
        const relativePath = path.relative(ROOT_DIR, directory);
        // Don't remove the src directory
        if (relativePath !== 'src') {
          try {
            fs.rmdirSync(directory);
            if (!isQuiet && shouldCleanup) {
              log(`✅ Removed empty directory: ${relativePath}`);
            }
            return true;
          } catch (error) {
            log(`❌ Failed to remove directory ${relativePath}: ${error.message}`, 'error');
            return false;
          }
        }
      }
    }
    
    return false;
  } catch (error) {
    log(`Error cleaning up directory ${directory}: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Performs breadth-first analysis of imports starting from entry points
 */
function performBreadthFirstAnalysis() {
  log('Analyzing imports...');
  
  // Start with entry points
  let filesToProcess = ENTRY_POINTS.map(entry => path.resolve(ROOT_DIR, entry));
  let processedFiles = new Set();
  
  // Process files breadth-first
  while (filesToProcess.length > 0) {
    const currentFile = filesToProcess.shift();
    if (processedFiles.has(currentFile)) continue;
    
    processedFiles.add(currentFile);
    analyzeImports(currentFile);
    
    // Add imported files to the processing queue
    for (const importedFile of importedFiles) {
      const fullPath = path.resolve(ROOT_DIR, importedFile);
      if (!processedFiles.has(fullPath)) {
        filesToProcess.push(fullPath);
      }
    }
  }
  
  // Mark files reachable from entry points as used
  for (const [file, info] of allFiles.entries()) {
    if (importedFiles.has(file)) {
      info.used = true;
    }
  }
}

/**
 * Outputs analysis results to console
 * @param {Array} usedFiles - Array of used file entries
 * @param {Array} unusedFiles - Array of unused file entries
 */
function outputResults(usedFiles, unusedFiles) {
  if (outputJson) {
    // Output JSON format for programmatic use
    console.log(JSON.stringify({
      totalFiles: allFiles.size,
      usedFiles: usedFiles.map(([file]) => file),
      unusedFiles: unusedFiles.map(([file]) => file)
    }));
    return;
  }
  
  log(`\nResults:`);
  log(`- Total source files: ${allFiles.size}`);
  log(`- Used files: ${usedFiles.length}`);
  log(`- Unused files: ${unusedFiles.length}`);
  
  log('\nPotentially unused files:');
  unusedFiles.forEach(([file]) => {
    log(`- ${file}`);
  });
  
  // Group unused files by directory
  const unusedByDir = {};
  unusedFiles.forEach(([file]) => {
    const dir = path.dirname(file);
    if (!unusedByDir[dir]) unusedByDir[dir] = 0;
    unusedByDir[dir]++;
  });
  
  log('\nUnused files by directory:');
  Object.entries(unusedByDir)
    .sort((a, b) => b[1] - a[1])
    .forEach(([dir, count]) => {
      log(`- ${dir}: ${count} file(s)`);
    });
  
  // Check for completely unused directories
  findUnusedDirectories();
}

/**
 * Identifies and reports completely unused directories
 */
function findUnusedDirectories() {
  const dirs = new Set([...allFiles.keys()].map(file => path.dirname(file)));
  const unusedDirs = [];
  
  dirs.forEach(dir => {
    const dirFiles = [...allFiles.entries()].filter(([file]) => path.dirname(file) === dir);
    const allUnused = dirFiles.every(([_, info]) => !info.used);
    if (allUnused && dirFiles.length > 0) {
      unusedDirs.push([dir, dirFiles.length]);
    }
  });
  
  log('\nCompletely unused directories:');
  unusedDirs
    .sort((a, b) => b[1] - a[1])
    .forEach(([dir, count]) => {
      log(`- ${dir}: ${count} file(s)`);
    });
}

/**
 * Main function to analyze the project
 */
function analyzeProject() {
  try {
    log('Collecting all source files...');
    collectFiles(SRC_DIR);
    log(`Found ${allFiles.size} source files.`);
    
    performBreadthFirstAnalysis();
    
    // Calculate stats
    const usedFiles = [...allFiles.entries()].filter(([_, info]) => info.used);
    const unusedFiles = [...allFiles.entries()].filter(([_, info]) => !info.used);
    
    outputResults(usedFiles, unusedFiles);
    
    // Generate report if requested
    if (shouldGenerateReport) {
      generateReport(unusedFiles);
    }
    
    // Suggest cleanup if requested
    suggestCleanup(unusedFiles);
    
    // Exit with error code if there are unused files and not in special modes
    if (unusedFiles.length > 0 && !isQuiet && !shouldCleanup && !shouldGenerateReport && !outputJson) {
      process.exit(1);
    }
  } catch (error) {
    log(`Critical error: ${error.message}`, 'error');
    log(error.stack, 'error');
    process.exit(1);
  }
}

// Run the analysis
analyzeProject();
