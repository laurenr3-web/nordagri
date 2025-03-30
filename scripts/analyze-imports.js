
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Track all files and their usage
const allFiles = new Map();
const importedFiles = new Set();
const entryPoints = ['src/main.tsx', 'src/App.tsx'];

// Function to collect all source files
function collectFiles(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
    const fullPath = path.join(dir, dirent.name);
    const relativePath = path.relative(ROOT_DIR, fullPath);
    
    if (dirent.isDirectory()) {
      collectFiles(fullPath);
    } else if (EXTENSIONS.includes(path.extname(dirent.name))) {
      allFiles.set(relativePath, { used: false, importedBy: [] });
    }
  });
}

// Function to analyze imports in a file
function analyzeImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+[^;]+|[^;{]*)\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Skip external packages
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        continue;
      }
      
      // Resolve the absolute path
      let absoluteImportPath;
      if (importPath.startsWith('@/')) {
        // Handle alias
        absoluteImportPath = path.join(SRC_DIR, importPath.slice(2));
      } else {
        // Handle relative imports
        absoluteImportPath = path.resolve(path.dirname(filePath), importPath);
      }
      
      // Add extensions if needed and check if file exists
      let resolvedPath = null;
      
      // Try exact path first
      if (fs.existsSync(absoluteImportPath)) {
        resolvedPath = absoluteImportPath;
      } else {
        // Try with extensions
        for (const ext of EXTENSIONS) {
          const pathWithExt = `${absoluteImportPath}${ext}`;
          if (fs.existsSync(pathWithExt)) {
            resolvedPath = pathWithExt;
            break;
          }
          
          // Check index files
          const indexPath = path.join(absoluteImportPath, `index${ext}`);
          if (fs.existsSync(indexPath)) {
            resolvedPath = indexPath;
            break;
          }
        }
      }
      
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
    console.error(`Error analyzing imports in ${filePath}:`, error.message);
  }
}

// Main function
function analyzeProject() {
  console.log('Collecting all source files...');
  collectFiles(SRC_DIR);
  
  console.log(`Found ${allFiles.size} source files.`);
  
  // Start with entry points
  let filesToProcess = entryPoints.map(entry => path.resolve(ROOT_DIR, entry));
  let processedFiles = new Set();
  
  console.log('Analyzing imports...');
  
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
  
  // Calculate stats
  const usedFiles = [...allFiles.entries()].filter(([_, info]) => info.used);
  const unusedFiles = [...allFiles.entries()].filter(([_, info]) => !info.used);
  
  console.log(`\nResults:`);
  console.log(`- Total source files: ${allFiles.size}`);
  console.log(`- Used files: ${usedFiles.length}`);
  console.log(`- Unused files: ${unusedFiles.length}`);
  
  console.log('\nPotentially unused files:');
  unusedFiles.forEach(([file]) => {
    console.log(`- ${file}`);
  });
  
  // Group unused files by directory
  const unusedByDir = {};
  unusedFiles.forEach(([file]) => {
    const dir = path.dirname(file);
    if (!unusedByDir[dir]) unusedByDir[dir] = 0;
    unusedByDir[dir]++;
  });
  
  console.log('\nUnused files by directory:');
  Object.entries(unusedByDir)
    .sort((a, b) => b[1] - a[1])
    .forEach(([dir, count]) => {
      console.log(`- ${dir}: ${count} file(s)`);
    });
  
  // Check for completely unused directories
  const dirs = new Set([...allFiles.keys()].map(file => path.dirname(file)));
  const unusedDirs = [];
  
  dirs.forEach(dir => {
    const dirFiles = [...allFiles.entries()].filter(([file]) => path.dirname(file) === dir);
    const allUnused = dirFiles.every(([_, info]) => !info.used);
    if (allUnused && dirFiles.length > 0) {
      unusedDirs.push([dir, dirFiles.length]);
    }
  });
  
  console.log('\nCompletely unused directories:');
  unusedDirs
    .sort((a, b) => b[1] - a[1])
    .forEach(([dir, count]) => {
      console.log(`- ${dir}: ${count} file(s)`);
    });
}

// Run the analysis
analyzeProject();
