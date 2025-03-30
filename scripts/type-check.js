
const { execSync } = require('child_process');
const path = require('path');

console.log('Running TypeScript type checking...');

try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('Type checking passed successfully!');
} catch (error) {
  console.error('Type checking failed. Please fix the errors above.');
  process.exit(1);
}
