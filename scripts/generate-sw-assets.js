const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '..', 'public');
const outputFile = path.join(__dirname, '..', 'service-worker.js');

// Function to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

// Get all file paths
const allFiles = getAllFiles(directoryPath);

// Filter and format the file paths for the service worker
const cacheFiles = allFiles
  .map(file => `"/${path.relative(directoryPath, file).replace(/\\/g, '/')}"`)
  .join(',\n      ');

// Read the existing service worker content
fs.readFile(outputFile, 'utf8', (err, data) => {
  if (err) {
    return console.log(err);
  }

  // Replace the placeholder with the dynamic list of files
  const updatedContent = data.replace('/* DYNAMIC_CACHE_LIST */', cacheFiles);

  // Write the updated content back to the service worker file
  fs.writeFile(outputFile, updatedContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('Service worker cache list updated successfully.');
  });
});
