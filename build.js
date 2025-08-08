const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Build Tailwind CSS
console.log('Building Tailwind CSS...');
execSync('npx tailwindcss -i ./styles.css -o ./dist/output.css --minify', { stdio: 'inherit' });

console.log('Build complete!'); 