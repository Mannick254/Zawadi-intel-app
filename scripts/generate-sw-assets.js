const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '..', 'public');
const outputFile = path.join(__dirname, '..', 'service-worker.js');

// Recursively collect all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Get all file paths
const allFiles = getAllFiles(directoryPath);

// Filter out unnecessary files (adjust as needed)
const filteredFiles = allFiles.filter(file => {
  const ext = path.extname(file);
  return !['.map', '.DS_Store'].includes(ext);
});

// Format paths for service worker
const cacheFiles = filteredFiles
  .map(file => `"/${path.relative(directoryPath, file).replace(/\\/g, '/')}"`)
  .join(',\n      ');

// Read and update service worker
fs.readFile(outputFile, 'utf8', (err, data) => {
  if (err) {
    console.error('❌ Error reading service worker:', err.message);
    process.exit(1);
  }

  const newVersion = `v${Date.now()}`;

  // Replace placeholders
  const updatedContent = data
    .replace('/* DYNAMIC_CACHE_LIST */', cacheFiles)
    .replace(/zawadi-intel-static-v\d+/, `zawadi-intel-static-${newVersion}`)
    .replace(/zawadi-intel-dynamic-v\d+/, `zawadi-intel-dynamic-${newVersion}`);

  fs.writeFile(outputFile, updatedContent, 'utf8', (err) => {
    if (err) {
      console.error('❌ Error writing service worker:', err.message);
      process.exit(1);
    }
    console.log('✅ Service worker cache list updated successfully.');
  });
});
